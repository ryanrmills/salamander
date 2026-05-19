const videos = [
  "salamander1.mp4",
  "salamander2.mov",
  "forest_intro.mp4",
  "tank_view_long.mp4",
];

const thumbnails = {
  // Map filename -> URL of an image to use as its thumbnail.
  // For now, use any salamander image you have or a placeholder service.
  "salamander1.mp4": "https://placehold.co/320x180?text=salamander1",
  "salamander2.mov": "https://placehold.co/320x180?text=salamander2",
  "forest_intro.mp4": "https://placehold.co/320x180?text=forest_intro",
  "tank_view_long.mp4": "https://placehold.co/320x180?text=tank_view_long",
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getVideos(){
    await delay(400);
    return videos;
}

export async function getThumbnail(filename){
    await delay(300);
    if(!thumbnails[filename]){
        throw new Error(`No thumbnail for ${filename}`);
    }
    return thumbnails[filename];
}

export async function submitProcessingJob(filename, targetColor, threshold){
    await delay(500);
    return {jobId: `mock-${Date.now()}`};
}

export async function getJobStatus(jobId){
    await delay(300);
    return {
        jobId,
        status: "complete",
        csvUrl: "https://example.com/results.csv"
    }
}