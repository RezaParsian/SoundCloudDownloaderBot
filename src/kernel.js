import {downloadTrack} from "@rezaparsian/soundclouddownloader";

export async function download(url) {
  return await downloadTrack(url);
}

export function  isUrl(url){
  const expression = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;
  const regex = new RegExp(expression);

  return url.match(regex);
}