import axios from 'axios';

type RequestType = 'get' | 'post' | 'put' | 'delete';

type Options = {
  headers?: Object;
};

type Params = {
  params?: any;
  data?: any;
  headers?: any;
};

const MakeRequest = (type: RequestType, endpoint: string, data = {}, options: Options = {}): Promise<any> => {
  let headers = {};
  const config: any = {};

  if (options && typeof options.headers !== 'undefined') {
    headers = options.headers;
  }

  let params: Params = {};
  let ltype = type.toLowerCase();
  if (ltype === 'get') {
    params.params = data;
  } else if (ltype === 'delete') {
    params.data = data;
    params.headers = headers;
  } else {
    params = data;
  }

  return axios[type](process.env.REACT_APP_API_URL + endpoint, params, { headers }).then((response) => {
    // delete response.config;
    delete response.request;
    return response.data;
  });
};

export default MakeRequest;
