import axios from "axios";

export const post_requests = async (url: string, data: any, token = "") => {
  let headers = {};
  if (token !== "") {
    headers = {
      Authorization: `Bearer ${token}`,
    };
  }

  const response = await axios.post(
    `${'https://api.6ixunit.store/api/'}${url}`,
    // `${'http://127.0.0.1:8000/api/'}${url}`,

    data,
    { headers }
  );
  return response;
};


export const post_request_with_image = async (
  url: string,
  data: any,
  token = ""
) => {
  let headers = {};
  if (token !== "") {
    headers = {
      Authorization: `Bearer ${token}`,
    };
  }

  const response = await axios.post(
    `${'https://api.6ixunit.store/api/'}${url}`,
    // `${'http://127.0.0.1:8000/api/'}${url}`,

    data,
    { headers: { ...headers, "Content-Type": "multipart/form-data" } }
  );
  return response;
};

export const get_requests = async (url: string, token = "") => {
  let headers = {};
  if (token !== "") {
    headers = {
      Authorization: `Bearer ${token}`,
    };
  }

  const response = await axios.get(
    `${'https://api.6ixunit.store/api/'}${url}`,
    // `${'http://127.0.0.1:8000/api/'}${url}`,

    { headers }
  );
  return response;
};

export const delete_requests = async (url: string, token = "") => {
  let headers = {};
  if (token !== "") {
    headers = {
      Authorization: `Bearer ${token}`,
    };
  }

  const response = await axios.delete(
    `${'https://api.6ixunit.store/api/'}${url}`,
    // `${'http://127.0.0.1:8000/api/'}${url}`,

    { headers }
  );
  return response;
};

export const put_requests = async (url: string, data: any, token = "") => {
  let headers = {};
  if (token !== "") {
    headers = {
      Authorization: `Bearer ${token}`,
    };
  }

  const response = await axios.put(
    `${'https://api.6ixunit.store/api/'}${url}`,
    // `${'http://127.0.0.1:8000/api/'}${url}`,

    data,
    { headers }
  );
  return response;
};

// export const put_request_with_image = async (
//   url: string,
//   data: any,
//   token = ""
// ) => {
//   let headers = {};
//   if (token !== "") {
//     headers = {
//       Authorization: `Bearer ${token}`,
//     };
//   }

//   const response = await axios.put(
//     `${'http://127.0.0.1:8000/api/'}${url}`,
//     data,
//     { headers: { ...headers, "Content-Type": "multipart/form-data" } }
//   );
//   return response;
// };



export const put_request_with_image = async (url: string, data: FormData, token = "") => {
  const headers: any = {
    "Content-Type": "multipart/form-data",
  }

  if (token !== "") {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await axios.put(
    `${'https://api.6ixunit.store/api/'}${url}`,
    // `${'http://127.0.0.1:8000/api/'}${url}`,
    data, { headers })
  return response
}

export const patch_requests = async (url: string, data: any, token = "") => {
  let headers = {};
  if (token !== "") {
    headers = {
      Authorization: `Bearer ${token}`,
    };
  }

  const response = await axios.patch(
    `${'https://api.6ixunit.store/api/'}${url}`,
    // `${'http://127.0.0.1:8000/api/'}${url}`,

    data,
    { headers }
  );
  return response;
};
