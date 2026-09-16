const BASE_URL = "http://localhost:8080";

/* Login/signup calls return 401 for plain wrong-credentials, not an expired
   session, so they are excluded from the auto-redirect below. */
const PUBLIC_AUTH_PATHS = ["/patients/login", "/doctors/login", "/admin/login", "/patients/signup"];

function apiFetch(path, options) {
  options = options || {};

  const headers = Object.assign({}, options.headers);
  const token = localStorage.getItem("token");
  if (token) {
    headers["Authorization"] = "Bearer " + token;
  }

  const finalOptions = Object.assign({}, options, { headers: headers });

  return fetch(BASE_URL + path, finalOptions).then(response => {
    if (response.status === 401 && PUBLIC_AUTH_PATHS.indexOf(path) === -1) {
      localStorage.clear();
      window.location.href = "login.html";
    }
    return response;
  });
}
