import { apiService } from '../apiService';
import { createClient } from '@/utils/supabase/client';

export interface UserProfile {
  id: string;
  role: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
}

interface UpdateProfileInput {
  avatar_url?: string;
  name?: string;
  displayName?: string;
  username?: string;
}

export const authApi = apiService.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getProfile: builder.query<UserProfile, void>({
      queryFn: async () => {
        const res = await fetch('/api/auth/profile');
        const data = await res.json();
        if (!res.ok) return { error: { status: res.status, data: data.error } };
        return { data };
      },
      providesTags: ['Profile'],
    }),
    updateProfile: builder.mutation<{ user?: { id: string } | null }, UpdateProfileInput>({
      queryFn: async (userData) => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { error: { status: 401, data: "Not authenticated" } };

        // 1. Update auth.user metadata
        const { data, error } = await supabase.auth.updateUser({
          data: userData
        });
        if (error) return { error };

        // 2. Update public.user_profiles
        // Handle mapping fields like avatar_url if provided
        const profileUpdate: Partial<Pick<UserProfile, "avatar_url" | "full_name">> & { display_name?: string } = {};
        if (userData.avatar_url) profileUpdate.avatar_url = userData.avatar_url;
        if (userData.name) profileUpdate.full_name = userData.name;
        if (userData.displayName) profileUpdate.display_name = userData.displayName;
        if (userData.username) profileUpdate.display_name = userData.username;

        if (Object.keys(profileUpdate).length > 0) {
          const { error: pError } = await supabase
            .from('user_profiles')
            .update(profileUpdate)
            .eq('id', user.id);

          if (pError) console.error("Profile table update failed:", pError);
        }

        return { data: data.user };
      },
      invalidatesTags: ['Profile'],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
} = authApi;
