"use client";
import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector, RootState } from "@/store";
import {
  useGetReviewsQuery,
  useCanReviewProductQuery,
  useAddReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
  useToggleLikeReviewMutation,
  useAddReplyMutation,
} from "@/store/api/reviewApi";
import toast from "react-hot-toast";
import { IoMdStar, IoMdStarOutline } from "react-icons/io";
import { X, Edit2, Trash2 } from "lucide-react";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { BsReply } from "react-icons/bs";
import ConfirmModal from "@/components/ui/ConfirmModal";
import DeleteReviewModal from "@/components/product/DeleteReviewModal";
import type { Review } from "@/store/api/reviewApi";

interface ReviewFormProps {
  rating: number;
  setRating: (value: number) => void;
  text: string;
  setText: (value: string) => void;
  submitting: boolean;
  onSubmit: () => void;
  onClose: () => void;
  isEditing?: boolean;
}

interface ReviewCardProps {
  review: Review;
  currentUserId?: string;
  onToggleLike: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSubmitReply: (reply: string) => void;
}

export const Stars = ({
  count,
  size = "text-lg md:text-xl",
}: {
  count: number;
  size?: string;
}) => (
  <div className={`flex text-[#141718] ${size}`}>
    {[...Array(5)].map((_, i) =>
      i < Math.round(count) ? (
        <IoMdStar key={i} />
      ) : (
        <IoMdStarOutline key={i} />
      ),
    )}
  </div>
);

export function ReviewForm({
  rating,
  setRating,
  text,
  setText,
  submitting,
  onSubmit,
  onClose,
  isEditing = false,
}: ReviewFormProps) {
  return (
    <div className="border border-[#E8ECEF] rounded-lg p-5 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h4 className="text-[16px] font-medium">
          {isEditing ? "Edit Your Review" : "Write a Review"}
        </h4>
        <button
          onClick={onClose}
          className="text-[#6C7275] cursor-pointer hover:text-black focus:outline-none"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-[14px] text-[#6C7275]">Rating</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              onClick={() => setRating(s)}
              className=" cursor-pointer text-[24px] focus:outline-none"
            >
              {s <= rating ? (
                <IoMdStar className="text-[#141718]" />
              ) : (
                <IoMdStarOutline className="text-[#6C7275]" />
              )}
            </button>
          ))}
        </div>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Share your experience..."
        rows={4}
        className="border border-[#E8ECEF] rounded-lg px-4 py-3 text-[14px] outline-none focus:border-black resize-none"
      />
      <button
        onClick={onSubmit}
        disabled={submitting || !text.trim()}
        className="self-end bg-black cursor-pointer text-white px-6 py-2.5 rounded-lg text-[14px] font-medium hover:opacity-90 disabled:opacity-50 transition"
      >
        {submitting
          ? "Processing..."
          : isEditing
            ? "Update Review"
            : "Submit Review"}
      </button>
    </div>
  );
}

export function ReviewCard({
  review,
  currentUserId,
  onToggleLike,
  onEdit,
  onDelete,
  onSubmitReply,
}: ReviewCardProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const isOwner = currentUserId === review.user_id;

  const handleReplySubmit = () => {
    if (!replyText.trim()) return;
    onSubmitReply(replyText);
    setReplyText("");
    setShowReplyForm(false);
  };

  return (
    <div className="flex flex-col gap-4 border-b border-[#E8ECEF] pb-6 last:border-0 transition-opacity">
      <div className="flex items-center gap-4">
        {review.user_avatar ? (
          <img
            src={review.user_avatar}
            alt={review.user_name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-[#F3F5F7] flex items-center justify-center font-semibold text-[#6C7275]">
            {review.user_name?.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{review.user_name}</span>
          </div>
          <Stars count={review.rating} size="text-[12px]" />
        </div>
        <span className="ml-auto text-xs text-[#6C7275]">
          {new Date(review.created_at).toLocaleDateString()}
        </span>
      </div>
      <p className="text-[#6C7275] text-sm leading-relaxed">{review.review}</p>
      <div className="flex items-center gap-6">
        <button
          onClick={onToggleLike}
          className="flex items-center cursor-pointer gap-1.5 text-[15px] text-[#6C7275] hover:text-black focus:outline-none"
        >
          {review.liked ? (
            <AiFillHeart className="text-red-500" />
          ) : (
            <AiOutlineHeart />
          )}
          <span>{review.likes_count > 0 ? review.likes_count : "Like"}</span>
        </button>
        <button
          onClick={() => setShowReplyForm(!showReplyForm)}
          className="flex cursor-pointer items-center gap-1.5 text-[14px] text-[#6C7275] hover:text-black focus:outline-none"
        >
          <BsReply />{" "}
          <span>
            Reply{" "}
            {review.replies?.length > 0 ? `(${review.replies.length})` : ""}
          </span>
        </button>
        {isOwner && (
          <div className="flex items-center gap-4 ml-auto">
            <button
              onClick={onEdit}
              className="flex cursor-pointer items-center gap-1 text-xs text-[#6C7275] hover:text-black focus:outline-none"
            >
              <Edit2 className="w-3 h-3" /> Edit
            </button>
            <button
              onClick={onDelete}
              className="flex items-center cursor-pointer gap-1 text-xs text-red-500 hover:text-red-700 focus:outline-none"
            >
              <Trash2 className="w-3 h-3" /> Delete
            </button>
          </div>
        )}
      </div>
      {review.replies?.length > 0 && (
        <div className="ml-10 flex flex-col gap-4 border-l-2 border-[#F3F5F7] pl-4 mt-2">
          {review.replies.map((r) => (
            <div key={r.id} className="flex gap-3">
              {r.user_avatar ? (
                <img
                  src={r.user_avatar}
                  alt={r.user_name}
                  className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-[#F3F5F7] flex items-center justify-center font-semibold text-[10px] text-[#6C7275] shrink-0 mt-0.5">
                  {r.user_name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold">{r.user_name}</span>
                  <span className="text-[#6C7275]">
                    {new Date(r.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-[#6C7275] text-xs mt-1">{r.reply}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      {showReplyForm && (
        <div className="ml-10 flex gap-2 mt-2 animasi-fade-in">
          <input
            className="flex-1 border rounded-lg px-3 py-2 text-xs outline-none focus:border-black"
            placeholder="Write a reply..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />
          <button
            onClick={handleReplySubmit}
            className="bg-black cursor-pointer text-white px-4 py-2 rounded-lg text-xs hover:opacity-90"
          >
            Post
          </button>
        </div>
      )}
    </div>
  );
}

export default function ReviewsSection({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: RootState) => state.auth);

  const { data: reviews = [], isLoading: loadingReviews } = useGetReviewsQuery({
    productId,
    userId: user?.id,
  });
  const { data: canReview = false } = useCanReviewProductQuery(
    { productId, userId: user?.id },
    { skip: !user?.id, refetchOnMountOrArgChange: true },
  );
  const [addReviewMutation, { isLoading: isAdding }] = useAddReviewMutation();
  const [updateReviewMutation, { isLoading: isUpdating }] =
    useUpdateReviewMutation();
  const [deleteReviewMutation] = useDeleteReviewMutation();
  const [toggleLikeMutation] = useToggleLikeReviewMutation();
  const [addReplyMutation] = useAddReplyMutation();

  const loading = loadingReviews || isAdding || isUpdating;
  const userReview = reviews.find((r) => r.user_id === user?.id) || null;

  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [sortOption, setSortOption] = useState("Newest");
  const formRef = useRef<HTMLDivElement>(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    reviewId: string | null;
    reviewText: string;
  }>({
    isOpen: false,
    reviewId: null,
    reviewText: "",
  });
  const [isDeletingReview, setIsDeletingReview] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        formRef.current &&
        !formRef.current.contains(event.target as Node) &&
        showForm
      ) {
        setShowForm(false);
        setIsEditing(false);
        setText("");
        setRating(5);
      }
    };

    if (showForm) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showForm]);

  const handleEdit = () => {
    if (!userReview) return;
    setText(userReview.review);
    setRating(userReview.rating);
    setIsEditing(true);
    setShowForm(true);
  };

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortOption === "Highest Rating") return b.rating - a.rating;
    if (sortOption === "Lowest Rating") return a.rating - b.rating;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum: number, r) => sum + r.rating, 0) / reviews.length
      : 0;
  const canShowReviewWriteSection =
    !!userReview || (Boolean(user) && canReview);

  return (
    <div className="flex flex-col gap-8 mt-10">
      <div className="flex flex-col gap-4">
        <h3 className="text-2xl font-medium">Customer Reviews</h3>
        <div className="flex items-center gap-2">
          <Stars count={avgRating} />
          <span className="text-sm text-[#6C7275]">
            {reviews.length} Reviews
          </span>
        </div>
        {canShowReviewWriteSection && (
          <div className="flex justify-between items-center border rounded-full px-6 py-3 mt-4">
            <span className="text-sm text-[#6C7275]">{productName}</span>
            <button
              onClick={() => {
                if (userReview) {
                  handleEdit();
                } else {
                  setShowForm(true);
                }
              }}
              className="bg-black cursor-pointer text-white px-6 py-2 rounded-full text-sm font-medium hover:opacity-90 transition"
            >
              {userReview ? "Edit Review" : "Write Review"}
            </button>
          </div>
        )}
      </div>

      {showForm && (
        <div ref={formRef}>
          <ReviewForm
            rating={rating}
            setRating={setRating}
            text={text}
            setText={setText}
            submitting={loading}
            isEditing={isEditing}
            onClose={() => setShowForm(false)}
            onSubmit={async () => {
              if (!user) return toast.error("Please sign in");
              if (!isEditing && !canReview) {
                return toast.error(
                  "Review is available after payment is completed.",
                );
              }
              try {
                if (isEditing && userReview) {
                  await updateReviewMutation({
                    productId,
                    reviewId: userReview.id,
                    rating,
                    review: text,
                  }).unwrap();
                  toast.success("Review updated!");
                } else {
                  const name =
                    user.user_metadata?.displayName ||
                    user.user_metadata?.full_name ||
                    user.user_metadata?.name ||
                    user.email?.split("@")[0] ||
                    "Anonymous";
                  await addReviewMutation({
                    productId,
                    userId: user.id,
                    userName: name,
                    rating,
                    review: text,
                  }).unwrap();
                  toast.success("Review submitted!");
                }
                setShowForm(false);
                setIsEditing(false);
                setText("");
                setRating(5);
              } catch (err: unknown) {
                const message =
                  err instanceof Error
                    ? err.message
                    : "Failed to process review";
                toast.error(message);
              }
            }}
          />
        </div>
      )}

      <div className="flex justify-between items-center border-b pb-4 mt-4">
        <h4 className="text-lg font-medium">{reviews.length} Reviews</h4>
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="bg-transparent cursor-pointer border rounded p-2 text-sm outline-none"
        >
          <option>Newest</option>
          <option>Highest Rating</option>
          <option>Lowest Rating</option>
        </select>
      </div>

      <div className="flex flex-col gap-6">
        {sortedReviews.length === 0 ? (
          <p className="text-[#6C7275] text-center py-10">
            No reviews yet. Be the first to share your thoughts!
          </p>
        ) : (
          sortedReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              currentUserId={user?.id}
              onToggleLike={() =>
                user
                  ? toggleLikeMutation({
                      productId,
                      reviewId: review.id,
                      userId: user.id,
                      liked: !!review.liked,
                    })
                  : toast.error("Please sign in")
              }
              onEdit={handleEdit}
              onDelete={() => {
                setDeleteConfirmModal({
                  isOpen: true,
                  reviewId: review.id,
                  reviewText: review.review,
                });
              }}
              onSubmitReply={async (reply: string) => {
                if (!user) return toast.error("Please sign in");
                try {
                  const name =
                    user.user_metadata?.displayName ||
                    user.user_metadata?.full_name ||
                    user.user_metadata?.name ||
                    user.email?.split("@")[0] ||
                    "Anonymous";
                  await addReplyMutation({
                    productId,
                    reviewId: review.id,
                    userId: user.id,
                    userName: name,
                    reply,
                  }).unwrap();
                  toast.success("Reply posted!");
                } catch (err) {
                  toast.error("Failed to post reply");
                }
              }}
            />
          ))
        )}
      </div>

      <DeleteReviewModal
        isOpen={deleteConfirmModal.isOpen}
        isLoading={isDeletingReview}
        onConfirm={async () => {
          if (!user || !deleteConfirmModal.reviewId) return;
          setIsDeletingReview(true);
          try {
            await deleteReviewMutation({
              productId,
              reviewId: deleteConfirmModal.reviewId,
              userId: user.id,
            }).unwrap();
            toast.success("Review deleted");
            setDeleteConfirmModal({
              isOpen: false,
              reviewId: null,
              reviewText: "",
            });
          } catch (err) {
            toast.error("Failed to delete review");
          } finally {
            setIsDeletingReview(false);
          }
        }}
        onCancel={() =>
          setDeleteConfirmModal({
            isOpen: false,
            reviewId: null,
            reviewText: "",
          })
        }
        reviewText={deleteConfirmModal.reviewText}
      />
    </div>
  );
}
