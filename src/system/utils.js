export const extractFilename = (pathString, imgDefault="") => {
  if (!pathString) {
    return imgDefault;
  }
  // Use a regular expression to split the string on both forward slashes and backslashes
  const parts = pathString.split(/[/\\]/);
  // The last part of the array should be the filename
  return parts.pop();
};

export const getThumbnailPath = imagePath => {
  const imagePathParts = imagePath.split('/');
  const filename = imagePathParts.pop();
  const thumbnailFilename = `thumb-${filename}`;
  imagePathParts.push(thumbnailFilename);
  return imagePathParts.join('/');
};
export const convertToMediaPath = (dbPath) => {
  const rtnValue=dbPath.replace(
    /^backend\\imageUploaded\\/,
    "/uploaded-images/"
  );
  return rtnValue?rtnValue:"";
}
