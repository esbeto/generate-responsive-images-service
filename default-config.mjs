const config = {
  preset: [
    {
      size: "medium",
    },
    {
      size: "medium",
      ext: "webp",
    },
    {
      size: "medium",
      scale: 2,
    },
    {
      size: "medium",
      ext: "webp",
      scale: 2,
    },
    {
      size: "small",
    },
    {
      size: "small",
      ext: "webp",
    },
    {
      size: "small",
      scale: 2,
    },
    {
      size: "small",
      ext: "webp",
      scale: 2,
    },
    {
      size: "small",
      scale: 3,
    },
    {
      size: "small",
      ext: "webp",
      scale: 3,
    },
  ],
  jpeg: {
    quality: 80,
    trellisQuantisation: true,
    overshootDeringing: true,
    optimiseScans: true,
  },
  imageSize: {
    medium: 750,
    small: 450,
  },
};

export default config;