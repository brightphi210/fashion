import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { get_requests, post_requests, put_request_with_image } from "../helper/AxioHelper";

export const useRegistration = () => {
  return useMutation({
    mutationFn: (data: any) => post_requests("auth/register/", data),
    // onSuccess shape: response.data = { message, email }
  });
};

export const useLogin = () => {
  return useMutation({
    mutationFn: (data: any) => post_requests("auth/login/", data),
    // onSuccess shape: response.data = { user, access, refresh }
    // onError shape (unverified): error.response.data = { email_verified: false, email }
  });
};


export const useAdminLogin = () => {
  return useMutation({
    mutationFn: (data: any) => post_requests("auth/admin/login/", data),
    // onSuccess shape: response.data = { user, access, refresh }
    // onError shape (unverified): error.response.data = { email_verified: false, email }
  });
};

export const useVerifyOTP = () => {
  return useMutation({
    mutationFn: (data: any) => post_requests("auth/verify-otp/", data),
    // onSuccess shape: response.data = { message, user, access, refresh }
  });
};

export const useResendOtp = () => {
  return useMutation({
    mutationFn: (data: any) => post_requests("auth/resend-otp/", data),
    // onSuccess shape: response.data = { message }
  });
};


export const useProfile = () => {
  const { data, isLoading, isError, isFetched, refetch } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const token = (await localStorage.getItem("accessToken")) || "";
      return get_requests("profile/", token);
    },
  });

  return {
    profile: data,
    isLoading,
    isError,
    isFetched,
    refetch,
  };
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient()

  const updateProfile = useMutation({
    mutationFn: async (data: any) => {
      const token = (await localStorage.getItem("accessToken")) || ""
      return put_request_with_image(`profile/update/`, data, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] })
    },
  })

  return updateProfile
}


