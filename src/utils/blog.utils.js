//create reading time algorithm

export const calculateReadingTime = (body) => {
  if (!body || typeof body !== "string") {
    return "0 minutes"
  }

  // Average reading speed is 200 words per minute
  const wordsPerMinute = 200

  // Calculate word count
  const wordCount = body.trim().split(/\s+/).length;

  const time = Math.ceil(wordCount / wordsPerMinute);

  return `${time} minute${time > 1 ? "s" : ""}`;
}



//Create function that convert tags to an array"

export const convertTagsToArray = (tags) => {
  const tagsArray = tags.split(",").map((tag) => tag.trim());
  return tagsArray
}
