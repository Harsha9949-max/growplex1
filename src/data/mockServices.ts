import { Service } from "../types";

export const MOCK_SERVICES: Service[] = [
  {
    id: "s1",
    category: "Instagram Followers",
    name: "Instagram Followers",
    deliveryTime: "1-24 hours",
    description: "Grow your Instagram followers quickly with high-quality, stable accounts.",
    packages: [
      { id: "pkg_1_1", quantity: "50", price: 11 },
      { id: "pkg_1_2", quantity: "100", price: 18 },
      { id: "pkg_1_3", quantity: "1000", price: 69 },
      { id: "pkg_1_4", quantity: "2000", price: 111 },
      { id: "pkg_1_5", quantity: "5000", price: 139 },
      { id: "pkg_1_6", quantity: "10000", price: 210 },
      { id: "pkg_1_7", quantity: "15000", price: 279 },
      { id: "pkg_1_8", quantity: "25000", price: 419 },
      { id: "pkg_1_9", quantity: "50000", price: 629 },
      { id: "pkg_1_10", quantity: "100K", price: 909 },
      { id: "pkg_1_11", quantity: "1M", price: 699 }
    ]
  },
  {
    id: "s2",
    category: "Instagram Likes",
    name: "Instagram Likes",
    deliveryTime: "Instant",
    description: "Instant likes on your latest Instagram post to boost engagement.",
    packages: [
      { id: "pkg_2_1", quantity: "1000", price: 42 },
      { id: "pkg_2_2", quantity: "2000", price: 67 },
      { id: "pkg_2_3", quantity: "5000", price: 97 },
      { id: "pkg_2_4", quantity: "10000", price: 139 },
      { id: "pkg_2_5", quantity: "20000", price: 209 }
    ]
  },
  {
    id: "s3",
    category: "Instagram Comments",
    name: "Instagram Comments",
    deliveryTime: "1-6 hours",
    description: "Customizable comments to spark conversation on your posts.",
    packages: [
      { id: "pkg_3_1", quantity: "100", price: 49 },
      { id: "pkg_3_2", quantity: "200", price: 91 },
      { id: "pkg_3_3", quantity: "500", price: 210 },
      { id: "pkg_3_4", quantity: "1000", price: 392 }
    ]
  },
  {
    id: "s4",
    category: "Instagram Reel Views",
    name: "Instagram Reel Views",
    deliveryTime: "Instant",
    description: "High retention Instagram Reel views to help your video rank higher in algorithms.",
    packages: [
      { id: "pkg_4_1", quantity: "5000", price: 10 },
      { id: "pkg_4_2", quantity: "10000", price: 17 },
      { id: "pkg_4_3", quantity: "25000", price: 35 },
      { id: "pkg_4_4", quantity: "50000", price: 63 },
      { id: "pkg_4_5", quantity: "100000", price: 105 },
      { id: "pkg_4_6", quantity: "200000", price: 126 },
      { id: "pkg_4_7", quantity: "300000", price: 153 },
      { id: "pkg_4_8", quantity: "500000", price: 175 },
      { id: "pkg_4_9", quantity: "1000000", price: 307 }
    ]
  },
  {
    id: "s5",
    category: "Instagram Story Views",
    name: "Instagram Story Views",
    deliveryTime: "Instant",
    description: "Increase story views quickly.",
    packages: [
      { id: "pkg_5_1", quantity: "1000", price: 34 },
      { id: "pkg_5_2", quantity: "2000", price: 49 },
      { id: "pkg_5_3", quantity: "5000", price: 63 },
      { id: "pkg_5_4", quantity: "10000", price: 119 }
    ]
  },
  {
    id: "yt_1",
    category: "YouTube Subscribers",
    name: "YouTube Subscribers",
    deliveryTime: "1-24 hours",
    description: "Grow your YouTube channel with active subscribers.",
    packages: [
      { id: "yt_pkg_1_1", quantity: "1000 Subscribers", price: 83 },
      { id: "yt_pkg_1_2", quantity: "2000 Subscribers", price: 111 },
      { id: "yt_pkg_1_3", quantity: "5000 Subscribers", price: 167 },
      { id: "yt_pkg_1_4", quantity: "10000 Subscribers", price: 279 },
      { id: "yt_pkg_1_5", quantity: "25000 Subscribers", price: 349 },
      { id: "yt_pkg_1_6", quantity: "50000 Subscribers", price: 559 },
      { id: "yt_pkg_1_7", quantity: "100K Subscribers", price: 419 },
      { id: "yt_pkg_1_8", quantity: "4K Watchtime + 2K Subscribers", price: 699 }
    ]
  },
  {
    id: "yt_2",
    category: "YouTube Views",
    name: "YouTube Views",
    deliveryTime: "Instant",
    description: "Boost your YouTube video rankings with high-retention views.",
    packages: [
      { id: "yt_pkg_2_1", quantity: "1000 Views", price: 34 },
      { id: "yt_pkg_2_2", quantity: "2000 Views", price: 55 },
      { id: "yt_pkg_2_3", quantity: "5000 Views", price: 84 },
      { id: "yt_pkg_2_4", quantity: "10000 Views", price: 139 },
      { id: "yt_pkg_2_5", quantity: "50000 Views", price: 279 },
      { id: "yt_pkg_2_6", quantity: "100000 Views", price: 335 },
      { id: "yt_pkg_2_7", quantity: "10 Million Views", price: 699 }
    ]
  },
  {
    id: "yt_3",
    category: "YouTube Likes",
    name: "YouTube Likes",
    deliveryTime: "1-6 hours",
    description: "Get genuine likes to increase your video's authority.",
    packages: [
      { id: "yt_pkg_3_1", quantity: "1000 Likes", price: 34 },
      { id: "yt_pkg_3_2", quantity: "2000 Likes", price: 49 },
      { id: "yt_pkg_3_3", quantity: "5000 Likes", price: 69 },
      { id: "yt_pkg_3_4", quantity: "10000 Likes", price: 125 }
    ]
  },
  {
    id: "yt_4",
    category: "YouTube Comments",
    name: "YouTube Comments",
    deliveryTime: "1-24 hours",
    description: "Custom comments to increase engagement on your videos.",
    packages: [
      { id: "yt_pkg_4_1", quantity: "100 Comments", price: 49 },
      { id: "yt_pkg_4_2", quantity: "200 Comments", price: 91 },
      { id: "yt_pkg_4_3", quantity: "500 Comments", price: 210 },
      { id: "yt_pkg_4_4", quantity: "1000 Comments", price: 392 }
    ]
  },
  {
    id: "tg_1",
    category: "Telegram Premium",
    name: "Telegram Premium",
    deliveryTime: "Instant - 24 hours",
    description: "Upgrade your Telegram account to Premium.",
    packages: [
      { id: "tg_pkg_1_1", quantity: "1 Month", price: 279 },
      { id: "tg_pkg_1_2", quantity: "3 Months", price: 349 },
      { id: "tg_pkg_1_3", quantity: "6 Months", price: 629 },
      { id: "tg_pkg_1_4", quantity: "12 Months", price: 1119 }
    ]
  },
  {
    id: "tg_2",
    category: "Telegram Group Members",
    name: "Telegram Group Members",
    deliveryTime: "1-24 hours",
    description: "Grow your Telegram Group fast.",
    packages: [
      { id: "tg_pkg_2_1", quantity: "500 Members", price: 69 },
      { id: "tg_pkg_2_2", quantity: "1000 Members", price: 111 },
      { id: "tg_pkg_2_3", quantity: "2000 Members", price: 195 },
      { id: "tg_pkg_2_4", quantity: "5000 Members", price: 419 },
      { id: "tg_pkg_2_5", quantity: "10000 Members", price: 769 }
    ]
  },
  {
    id: "tg_3",
    category: "Telegram Channel Subscribers",
    name: "Telegram Channel Subscribers",
    deliveryTime: "1-24 hours",
    description: "Increase visibility with Channel Subscribers.",
    packages: [
      { id: "tg_pkg_3_1", quantity: "500 Subscribers", price: 63 },
      { id: "tg_pkg_3_2", quantity: "1000 Subscribers", price: 111 },
      { id: "tg_pkg_3_3", quantity: "2000 Subscribers", price: 195 },
      { id: "tg_pkg_3_4", quantity: "5000 Subscribers", price: 405 },
      { id: "tg_pkg_3_5", quantity: "10000 Subscribers", price: 741 }
    ]
  },
  {
    id: "tg_4",
    category: "Telegram Post Views",
    name: "Telegram Post Views",
    deliveryTime: "Instant",
    description: "Boost your Telegram Post reaches.",
    packages: [
      { id: "tg_pkg_4_1", quantity: "1000 Views", price: 27 },
      { id: "tg_pkg_4_2", quantity: "5000 Views", price: 69 },
      { id: "tg_pkg_4_3", quantity: "10000 Views", price: 125 },
      { id: "tg_pkg_4_4", quantity: "50000 Views", price: 279 },
      { id: "tg_pkg_4_5", quantity: "100000 Views", price: 489 },
      { id: "tg_pkg_4_6", quantity: "500000 Views", price: 1399 },
      { id: "tg_pkg_4_7", quantity: "1000000 Views", price: 2519 }
    ]
  },
  {
    id: "tg_5",
    category: "Telegram Reactions",
    name: "Telegram Reactions",
    deliveryTime: "Instant",
    description: "Engage your audience with reactions.",
    packages: [
      { id: "tg_pkg_5_1", quantity: "100 Reactions", price: 27 },
      { id: "tg_pkg_5_2", quantity: "500 Reactions", price: 83 },
      { id: "tg_pkg_5_3", quantity: "1000 Reactions", price: 125 }
    ]
  }
];
