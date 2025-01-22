import axios from 'axios';
import {CookieJar} from 'tough-cookie'
import axiosCookieJarSupport from "axios-cookiejar-support";

// axiosCookieJarSupport(axios);

const jar = new CookieJar();
// axios.defaults.jar = jar;
axios.defaults.withCredentials = true;

axios.defaults.baseURL = 'http://localhost:9002';

export default axios;