import Messages from "./messages_string";
import HttpStatusCode from "./http_status_code";

export function sendResponse(
  res: any,
  status: HttpStatusCode,
  message: Messages
) {
  res.status(status).json({ message: message });
}
