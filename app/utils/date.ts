/**
 * 格式化最后登录时间为相对时间
 */
export function formatLastLoginTime(lastLoginAt: Date | string | null | undefined): string {
  if (!lastLoginAt) {
    return '从未登录';
  }

  const now = new Date();
  const loginTime = new Date(lastLoginAt);
  const diffInMs = now.getTime() - loginTime.getTime();

  const minutes = Math.floor(diffInMs / (1000 * 60));
  const hours = Math.floor(diffInMs / (1000 * 60 * 60));
  const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (minutes < 1) {
    return '刚刚';
  } else if (minutes < 60) {
    return `${minutes}分钟前`;
  } else if (hours < 24) {
    return `${hours}小时前`;
  } else if (days === 1) {
    return '昨天';
  } else if (days < 7) {
    return `${days}天前`;
  } else {
    // 超过一周显示具体日期
    return loginTime.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}
