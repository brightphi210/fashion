import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { delete_requests, get_requests, patch_requests, post_requests } from "../helper/AxioHelper";


// ==================== CERTIFICATE HOOKS ====================

export const useGetCategories = () => {
  const { data, isLoading, isError, isFetched, refetch } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const token = (await localStorage.getItem("sxiAccessToken")) || "";
      return get_requests("categories/", token);
    },
  });

  return {
    categories: data,
    isLoading,
    isError,
    isFetched,
    refetch,
  };
};


export const useGetProducts = () => {
  const { data, isLoading, isError, isFetched, refetch } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const token = (await localStorage.getItem("sxiAccessToken")) || "";
      return get_requests("products/", token);
    },
  });

  return {
    products: data,
    isLoading,
    isError,
    isFetched,
    refetch,
  };
};


export const useGetOrders = () => {
  const { data, isLoading, isError, isFetched, refetch } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const token = (await localStorage.getItem("sxiAccessToken")) || "";
      return get_requests("orders/", token);
    },
  });

  return {
    orders: data,
    isLoading,
    isError,
    isFetched,
    refetch,
  };
};

export const useGetSingleProduct = (productId: number) => {
  const { data, isLoading, isError, isFetched, refetch } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const token = (await localStorage.getItem("sxiAccessToken")) || "";
      return get_requests(`products/${productId}/`, token);
    },
  });

  return {
    product: data,
    isLoading,
    isError,
    isFetched,
    refetch,
  };
};


export const useCreateProduct = () => {
  const queryClient = useQueryClient()

  const createProduct = useMutation({
    mutationFn: async (data: any) => {
      const token = (await localStorage.getItem("sxiAccessToken")) || ""
      return post_requests(`products/`, data, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
  })

  return createProduct
}



export const useUpdateProduct = () => {
  const queryClient = useQueryClient()

  const updateProduct = useMutation({
    mutationFn: async (data: any) => {
      const token = (await localStorage.getItem("sxiAccessToken")) || ""
      return post_requests(`products/${data.id}/`, data, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
  })

  return updateProduct
}


export const useDeleteProduct = () => {
  const queryClient = useQueryClient()

  const deleteProduct = useMutation({
    mutationFn: async (productId: number) => {
      const token = (await localStorage.getItem("sxiAccessToken")) || ""
      return delete_requests(`products/${productId}/`, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
  })

  return deleteProduct
}

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient()

  const updateOrderStatus = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      const token = (await localStorage.getItem("sxiAccessToken")) || ""
      return patch_requests(`orders/${orderId}/`, { status }, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
    },
  })

  return updateOrderStatus
}


export const useNewsletterSubscribe = () => {
  const subscribe = useMutation({
    mutationFn: async (email: string) => {
      return post_requests('newsletter/subscribe/', { email }, '')
    },
  })
  return subscribe
}