import { FetchError } from 'ofetch';

export default defineNuxtPlugin((nuxtApp) => {
  const toast = useToast();

  nuxtApp.vueApp.config.errorHandler = async (error) => {
    if (error instanceof FetchError) {
      const message = getFetchErrorMessage(error);
      toast.add({
        title: message,
        color: 'error',
        icon: 'i-heroicons-x-circle',
      });
      return;
    }
  };

  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason instanceof FetchError) {
      const message = getFetchErrorMessage(event.reason);
      toast.add({
        title: message,
        color: 'error',
        icon: 'i-heroicons-x-circle',
      });

      event.preventDefault();
      return;
    }
  });
});

function getFetchErrorMessage(error: FetchError) {
  const message = error.response?._data?.message;
  if (message) {
    return message;
  }

  const status = error.status;
  if (!status) {
    return error.statusMessage;
  }

  switch (status) {
    case 400:
      return '请求参数错误';
    case 403:
      return '权限不足';
    case 404:
      return '请求的资源不存在';
    case 500:
      return '服务器内部错误';
    case 502:
      return '网关错误';
    case 503:
      return '服务暂时不可用';
    default:
      return `请求失败 (${status})`;
  }
}
