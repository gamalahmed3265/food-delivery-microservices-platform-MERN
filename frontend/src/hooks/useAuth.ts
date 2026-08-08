import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/auth";

export const useLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (res) => {
      localStorage.setItem("token", res.data.token);
      queryClient.invalidateQueries({ queryKey: ["me"] });
      navigate("/");
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (res) => {
      localStorage.setItem("token", res.data.token);
      queryClient.invalidateQueries({ queryKey: ["me"] });
      navigate("/");
    },
  });
};

export const useMe = () => {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => authApi.getMe(),
    enabled: !!localStorage.getItem("token"),
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return () => {
    localStorage.removeItem("token");
    queryClient.clear();
    navigate("/login");
  };
};