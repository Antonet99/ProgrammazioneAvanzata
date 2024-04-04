import Messages from "./messages_string";
import HttpStatusCode from "./http_status_code";


export function sendResponse(
  res: any,
  status: HttpStatusCode,
  message?: Messages,
  obj?: object
) {

  if (message && obj) {
    res.status(status).json({ message: message, data: obj });
    return;
  }

  if (message) {
    res.status(status).json({ message: message });
    return;
  }

  if (obj) {
    res.status(status).json(obj);
    return;
  }


  res.status(status).send();
  /*if (!message && !obj) {
    res.status(status).send();
    return;
  }*/

  
}


/*
let js = { message : message, data : obj};
res.status(status).json(js);
*/