export const lessonsData = {
  // One subject, not two difficulty tiers. Lessons keep their original
  // translation keys, so only the grouping changed.
  malware: [
    {
      slug: "virus",
      title: "Virus",
      titleKey: "basic.virus.title",
      descKey: "basic.virus.description",
      image: "/lessons/virusesCoverPage.jpeg",
      videoUrl: "/lessons/vids/virus.mp4",
      simulationUrl: "/demos/virusDemo.mp4",
      videoCaption: "/captions/eng/basic/virus_story.vtt",
      demoCaption: "/captions/eng/basic/virus_demo.vtt",
      posterUrl: "/posters/virus.svg",
      quizUrl: "",
    },
    {
      slug: "worm",
      title: "Worm",
      titleKey: "basic.worm.title",
      descKey: "basic.worm.description",
      image: "/lessons/wormsCoverPage.jpeg",
      videoUrl: "/lessons/vids/worms.mp4",
      simulationUrl: "/demos/finalWormDemo.mp4",
      videoCaption: "/captions/eng/basic/worm_story.vtt",
      demoCaption: "/captions/eng/basic/worm_demo.vtt",
      posterUrl: "/posters/worm.svg",
      quizUrl: "",
    },
    {
      slug: "ransomware",
      title: "Ransomware",
      titleKey: "basic.ransomware.title",
      descKey: "basic.ransomware.description",
      image: "/lessons/ransomwareCoverPage.jpeg",
      videoUrl: "/lessons/vids/ransomware.mp4",
      simulationUrl: "/demos/ransomDemo.mp4",
      videoCaption: "/captions/eng/basic/ransom_story.vtt",
      demoCaption: "/captions/eng/basic/ransom_demo.vtt",
      posterUrl: "/posters/ransomware.svg",
      quizUrl: "",
    },
    {
      slug: "polymorphic-metamorphic",
      title: "Polymorphic & Metamorphic",
      titleKey: "advanced.polymorphic-metamorphic.title",
      descKey: "advanced.polymorphic-metamorphic.description",
      image: "/lessons/poly&meta.jpeg",
      videoUrl: "/lessons/vids/poly&meta.mp4",
      simulationUrl: "/demos/poly&meta.mp4",
      videoCaption: "/captions/eng/advanced/polymeta_story.vtt",
      demoCaption: "/captions/eng/advanced/polymeta_demo.vtt",
      posterUrl: "/posters/poly&meta.svg",
      quizUrl: "",
    },
  ],
};

/**
 * Simulations that belong under a category's lessons.
 *
 * Malware lessons and malware simulations teach the same thing in two ways, so
 * they live on one page rather than in separate parts of the site. Ids match
 * SIM_MAP in app/simulations/simMap.ts and the Hub.simList translation keys.
 */
export const categorySims: Record<string, string[]> = {
  malware: ["virus", "worm", "ransomware", "rootkit", "keylogger", "polymorphic", "metamorphic"],
};
