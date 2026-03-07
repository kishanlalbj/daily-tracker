export const BASE_API_URL = process.env.NEXT_PUBLIC_URL;

export const paths = {
  HEATH_API: `${BASE_API_URL}/health`,
  USERS_API: `${BASE_API_URL}/users`,
  EXPENSE_API: `${BASE_API_URL}/expenses`,
  CATEGORY_API: `${BASE_API_URL}/category`,
  LOGIN_API: `${BASE_API_URL}/auth/login`,
  REGISTER_API: `${BASE_API_URL}/auth/register`,
  LOGOUT_API: `${BASE_API_URL}/auth/logout`,
  DASHBOARD_API: `${BASE_API_URL}/dashboard`,
  DELETE_USERS_API: `${BASE_API_URL}/users/delete`,
  RECURRING_EXPENSE_API: `${BASE_API_URL}/recurring-expenses`,
  RECURRING_INCOME_API: `${BASE_API_URL}/recurring-income`,
  INCOME_API: `${BASE_API_URL}/income`,
  BUDGET_API: `${BASE_API_URL}/budget`,
  GOALS_API: `${BASE_API_URL}/goals`,
  ASSETS_API: `${BASE_API_URL}/assets`,
  LIABILITIES_API: `${BASE_API_URL}/liabilities`
};
