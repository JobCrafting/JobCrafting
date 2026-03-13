
import React, { useEffect, useState, useRef } from 'react';
import { suggestJobs, SuggestJobsParams } from '../services/geminiService';
import { JobListing } from '../types';

interface JobFinderProps {
  targetJob: string;
  isFreelance?: boolean;
}

const SCOUTING_MESSAGES = [
  "Broadcasting search parameters...",
  "Querying global job networks...",
  "Filtering by skill-match density...",
  "Optimizing for compensation targets...",
  "Finalizing match results..."
];

const JobFinder: React.FC<JobFinderProps> = ({ targetJob, isFreelance = false }) => {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [scoutingStep, setScoutingStep] = useState(0);
  
  const [keywords, setKeywords] = useState(targetJob);
  const [location, setLocation] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);

  const listRef = useRef<HTMLDivElement>(null);

  // Cycle scouting messages
  useEffect(() => {
    let interval: number;
    if (loading) {
      setScoutingStep(0);
      interval = window.setInterval(() => {
        setScoutingStep(prev => (prev + 1) % SCOUTING_MESSAGES.length);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const fetchJobs = async (customParams?: Partial<SuggestJobsParams>) => {
    setLoading(true);
    const params: SuggestJobsParams = {
      query: customParams?.query || keywords || targetJob,
      location: customParams?.location || location,
      isFreelance: isFreelance,
      remoteOnly: customParams?.remoteOnly ?? remoteOnly
    };

    const result = await suggestJobs(params);
    setJobs(result);
    if (result.length > 0) {
      setSelectedJob(result[0]);
    } else {
      setSelectedJob(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchJobs();
    const saved = localStorage.getItem('jobcraft_saved_jobs');
    if (saved) setSavedJobs(JSON.parse(saved));
  }, [targetJob, isFreelance]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  const toggleSaveJob = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSaved = savedJobs.includes(id) 
      ? savedJobs.filter(sid => sid !== id) 
      : [...savedJobs, id];
    setSavedJobs(newSaved);
    localStorage.setItem('jobcraft_saved_jobs', JSON.stringify(newSaved));
  };

  const handleJobSelect = (job: JobListing) => {
    setSelectedJob(job);
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Indeed-style Header */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-bl-full opacity-50 -z-0"></div>
        
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 relative z-10">
          <div className="flex-1 relative">
            <label className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black text-[10px] uppercase tracking-widest">What</label>
            <input 
              type="text" 
              placeholder="Job title or keywords"
              className="w-full pl-16 pr-4 py-4 bg-gray-50 border-gray-200 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all font-bold"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
          </div>
          <div className="flex-1 relative">
            <label className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black text-[10px] uppercase tracking-widest">Where</label>
            <input 
              type="text" 
              placeholder="City or 'Remote'"
              className="w-full pl-16 pr-4 py-4 bg-gray-50 border-gray-200 rounded-2xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all font-bold"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="bg-brand-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-brand-700 transition-all shadow-xl shadow-brand-200 active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : (
              'Scout Market'
            )}
          </button>
        </form>

        <div className="mt-6 flex flex-wrap gap-2 relative z-10">
          <button 
            onClick={() => { setRemoteOnly(!remoteOnly); fetchJobs({ remoteOnly: !remoteOnly }); }}
            className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest border-2 transition-all ${
              remoteOnly ? 'bg-brand-600 text-white border-brand-600 shadow-lg' : 'bg-white text-gray-500 border-gray-100 hover:border-brand-200'
            }`}
          >
            {remoteOnly ? '✓ Remote Enabled' : 'Remote Only'}
          </button>
          {['Job Type', 'Salary Range', 'Industry'].map(filter => (
            <button key={filter} className="px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest bg-white text-gray-400 border-2 border-gray-100 hover:border-brand-200 transition-all">
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex gap-8 overflow-hidden min-h-[600px] relative">
        {/* Scouting Overlay */}
        {loading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gray-50/80 backdrop-blur-md rounded-3xl border-2 border-dashed border-brand-200 animate-in fade-in duration-300">
            <div className="relative w-40 h-40 mb-8">
              <div className="absolute inset-0 border-4 border-brand-500/20 rounded-full animate-[spin_3s_linear_infinite]"></div>
              <div className="absolute inset-4 border-4 border-brand-500/40 rounded-full animate-[spin_2s_linear_infinite_reverse]"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-16 h-16 bg-brand-600 rounded-2xl shadow-[0_0_30px_rgba(37,99,235,0.4)] flex items-center justify-center animate-pulse">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                 </div>
              </div>
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">Opportunity Scouting</h3>
            <p className="text-brand-600 font-black text-xs uppercase tracking-[0.3em] animate-pulse h-4">
              {SCOUTING_MESSAGES[scoutingStep]}
            </p>
          </div>
        )}

        {/* Left Pane: Job List */}
        <div className="w-full md:w-5/12 overflow-y-auto pr-2 scrollbar-hide space-y-4" ref={listRef}>
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <div 
                key={job.id} 
                onClick={() => handleJobSelect(job)}
                className={`group relative bg-white rounded-3xl border-2 cursor-pointer transition-all p-6 hover:shadow-2xl ${
                  selectedJob?.id === job.id ? 'border-brand-600 shadow-xl shadow-brand-50' : 'border-gray-100 hover:border-brand-200'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-black text-gray-900 text-xl leading-tight group-hover:text-brand-600 transition-colors">{job.title}</h3>
                    <p className="text-gray-600 font-bold mt-1">{job.company}</p>
                  </div>
                  <button 
                    onClick={(e) => toggleSaveJob(job.id, e)}
                    className={`p-2 rounded-xl transition-all ${savedJobs.includes(job.id) ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-400'}`}
                  >
                    <svg className="w-6 h-6" fill={savedJobs.includes(job.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
                
                <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-gray-400 mb-6">
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {job.location}
                  </span>
                  {job.isRemote && (
                    <span className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg">Remote</span>
                  )}
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                  <div className="text-brand-700 font-black text-lg">{job.salary}</div>
                  <div className="text-[10px] font-black uppercase tracking-tighter text-gray-400">Listed {job.postedDate}</div>
                </div>
              </div>
            ))
          ) : !loading && (
            <div className="bg-white p-12 text-center rounded-[2.5rem] border border-dashed border-gray-200 text-gray-400">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <p className="font-bold text-gray-500">No matches found</p>
              <p className="text-sm mt-2">Try broader keywords or different locations.</p>
            </div>
          )}
        </div>

        {/* Right Pane: Job Details */}
        <div className="hidden md:flex flex-1 flex-col bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-2xl">
          {selectedJob ? (
            <>
              <div className="p-10 border-b border-gray-50 sticky top-0 bg-white z-10 shadow-sm">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex-1 pr-6">
                    <h2 className="text-3xl font-black text-gray-900 leading-tight mb-3">{selectedJob.title}</h2>
                    <div className="flex items-center gap-4">
                      <p className="text-brand-600 font-black text-xl">{selectedJob.company}</p>
                      {selectedJob.companyRating && (
                         <div className="flex items-center gap-1.5 bg-brand-50 px-3 py-1 rounded-full">
                            <span className="font-black text-brand-700 text-sm">{selectedJob.companyRating}</span>
                            <span className="text-brand-400 text-sm">★</span>
                         </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 shrink-0">
                    <button className="bg-brand-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-brand-700 transition-all shadow-xl shadow-brand-100 active:scale-95">
                      Apply Now
                    </button>
                    <button 
                      onClick={(e) => toggleSaveJob(selectedJob.id, e)}
                      className="flex items-center justify-center gap-2 border-2 border-gray-100 py-3 rounded-2xl font-black text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                       <svg className={`w-5 h-5 ${savedJobs.includes(selectedJob.id) ? 'text-red-500 fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {savedJobs.includes(selectedJob.id) ? 'Saved' : 'Save for later'}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide">
                <section>
                   <h3 className="text-xs font-black text-brand-400 uppercase tracking-[0.2em] mb-6">Core Statistics</h3>
                   <div className="grid grid-cols-2 gap-6">
                      <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Base Salary</p>
                         <div className="text-2xl font-black text-gray-900">{selectedJob.salary}</div>
                      </div>
                      <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Contract Type</p>
                         <div className="text-2xl font-black text-gray-900">{selectedJob.type}</div>
                      </div>
                   </div>
                </section>

                <section>
                   <h3 className="text-xs font-black text-brand-400 uppercase tracking-[0.2em] mb-6">Mission Overview</h3>
                   <p className="text-gray-600 font-medium text-lg leading-relaxed mb-8">
                      {selectedJob.description}
                   </p>
                   <h4 className="text-xs font-black text-gray-900 mb-4 uppercase tracking-widest">Target Competencies:</h4>
                   <ul className="space-y-4">
                      {selectedJob.requirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-3 text-gray-700 font-bold group">
                           <span className="mt-1 w-2 h-2 bg-brand-500 rounded-full group-hover:scale-150 transition-transform"></span>
                           {req}
                        </li>
                      ))}
                   </ul>
                </section>

                <section className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-10">
                      <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 3.45l8.15 14.1H3.85L12 5.45zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z"/></svg>
                   </div>
                   <h3 className="font-black text-xl mb-3">AI Match Confidence</h3>
                   <p className="text-slate-400 font-medium mb-6">Based on your JobCraft profile, this role matches 94% of your identified skills and career trajectory.</p>
                   <button className="text-brand-400 font-black text-sm uppercase tracking-widest hover:text-brand-300 transition-colors">View Match Analysis →</button>
                </section>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-300 p-12 text-center">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <svg className="w-12 h-12 opacity-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-2xl font-black text-gray-400">Target a listing</p>
              <p className="text-gray-400 mt-2 font-medium">Select a job from the grid to reveal intelligence.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobFinder;
