import type { HttpMethod } from '~~/shared/types/project';

export const getColor = (method: HttpMethod) => {
  switch (method) {
    case 'GET':
      return 'success';
    case 'POST':
      return 'primary';
    case 'PUT':
      return 'warning';
    case 'DELETE':
      return 'error';
    case 'PATCH':
      return 'secondary';
    default:
      return 'neutral';
  }
};
