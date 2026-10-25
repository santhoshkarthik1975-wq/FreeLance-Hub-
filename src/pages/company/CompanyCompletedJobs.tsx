import React, { useState, useEffect } from 'react';
import { CheckCircle2, User, Star, X } from 'lucide-react';
import { api } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';
import { StatusBadge } from '../../components/ui/StatusBadge.tsx';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader.tsx';
import { EmptyState } from '../../components/ui/EmptyState.tsx';
import { formatMinorUnits, formatDate } from '../../utils/formatters.ts';
import type { Contract, Review } from '../../types/index.ts';

export const CompanyCompletedJobs: React.FC = () => {
  const [completedContracts, setCompletedContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  // Review modal
  const [reviewContract, setReviewContract] = useState<Contract | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewsMap, setReviewsMap] = useState<Record<string, Review[]>>({});

  const toast = useToast();

  const fetchCompletedJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/company/contracts');
      if (res.data?.data?.completed) {
        setCompletedContracts(res.data.data.completed);

        const map: Record<string, Review[]> = {};
        for (const c of res.data.data.completed) {
          try {
            const rRes = await api.get(`/contracts/${c._id}/reviews`);
            if (rRes.data?.data) {
              map[c._id] = rRes.data.data;
            }
          } catch {
            // ignore
          }
        }
        setReviewsMap(map);
      }
    } catch (err: any) {
      toast.error('Failed to load completed jobs: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompletedJobs();
  }, []);

  const handleOpenReview = (c: Contract) => {
    setReviewContract(c);
    setRating(5);
    setReviewText('');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewContract) return;

    if (reviewText.trim().length < 5) {
      toast.error('Review text must be at least 5 characters');
      return;
    }

    setSubmittingReview(true);
    try {
      await api.post(`/contracts/${reviewContract._id}/reviews`, {
        rating,
        reviewText,
      });
      toast.success('Freelancer rating and review published!');
      setReviewContract(null);
      await fetchCompletedJobs();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Completed Projects Archive</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review delivered engineering contracts, final disbursed amounts, and contractor ratings.
        </p>
      </div>

      {loading ? (
        <SkeletonLoader rows={2} />
      ) : completedContracts.length === 0 ? (
        <EmptyState
          title="No Completed Projects Yet"
          description="Contracts reach completion once all required milestones have been approved and paid in full."
        />
      ) : (
        <div className="space-y-4">
          {completedContracts.map((c) => {
            const reviews = reviewsMap[c._id] || [];
            const myReview = reviews.find((r) => r.reviewerRole === 'COMPANY');
            const freelancerReview = reviews.find((r) => r.reviewerRole === 'FREELANCER');

            return (
              <div
                key={c._id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge status={c.status} size="sm" />
                      <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        Contractor: {c.freelancerName || 'Freelancer'}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{c.contractTitle}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Completed on {formatDate(c.completionDate || c.updatedAt)}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Total Settled Value</span>
                    <p className="text-lg font-mono font-bold text-emerald-700">
                      {formatMinorUnits(c.agreedAmount, c.currency)}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>All project milestones satisfied and disbursed.</span>
                  </div>

                  {!myReview && (
                    <button
                      onClick={() => handleOpenReview(c)}
                      className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition flex items-center gap-1"
                    >
                      <Star className="w-3.5 h-3.5" /> Rate Freelancer
                    </button>
                  )}
                </div>

                {/* Reviews Section */}
                {reviews.length > 0 && (
                  <div className="space-y-2 pt-1 text-xs">
                    <h4 className="font-bold text-slate-900">Project Performance Reviews</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {myReview && (
                        <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-100">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-slate-900">Your Evaluation of Contractor</span>
                            <div className="flex items-center text-amber-500">
                              {Array.from({ length: myReview.rating }).map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-amber-500" />
                              ))}
                            </div>
                          </div>
                          <p className="text-slate-600 italic">"{myReview.reviewText}"</p>
                        </div>
                      )}

                      {freelancerReview && (
                        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-slate-900">Freelancer's Review of Company</span>
                            <div className="flex items-center text-amber-500">
                              {Array.from({ length: freelancerReview.rating }).map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-amber-500" />
                              ))}
                            </div>
                          </div>
                          <p className="text-slate-600 italic">"{freelancerReview.reviewText}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {reviewContract && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-start gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Review Contractor Performance</h3>
                <p className="text-xs text-slate-500">{reviewContract.contractTitle}</p>
              </div>
              <button
                onClick={() => setReviewContract(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Rating (1 to 5 Stars)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= rating
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 font-bold text-sm text-slate-700">{rating} / 5</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Performance & Code Quality Comments
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Share details regarding timeliness, code architecture, and collaboration..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReviewContract(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs disabled:opacity-50"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Contractor Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
