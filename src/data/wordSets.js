export const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'food', label: 'Food & Drink' },
  { id: 'sport', label: 'Sport' },
  { id: 'places', label: 'Places' },
  { id: 'entertainment', label: 'Entertainment' },
  { id: 'funny', label: 'Funny / Adult' },
];

// category: 'general' = appears in All only, not filterable
export const wordSets = [
  // Food & Drink
  { category: 'food', pair: ['Pizza', 'Burger'] },
  { category: 'food', pair: ['Coffee', 'Tea'] },
  { category: 'food', pair: ['Beer', 'Cider'] },
  { category: 'food', pair: ['Sushi', 'Sashimi'] },
  { category: 'food', pair: ['Pasta', 'Noodles'] },
  { category: 'food', pair: ['Curry', 'Stew'] },
  { category: 'food', pair: ['Chips', 'Crisps'] },
  { category: 'food', pair: ['Cocktail', 'Mocktail'] },
  { category: 'food', pair: ['Kebab', 'Shawarma'] },
  { category: 'food', pair: ['Pancakes', 'Waffles'] },
  { category: 'food', pair: ['Wine', 'Prosecco'] },
  { category: 'food', pair: ['Steak', 'Lamb Chop'] },

  // Sport
  { category: 'sport', pair: ['Football', 'Rugby'] },
  { category: 'sport', pair: ['Tennis', 'Badminton'] },
  { category: 'sport', pair: ['Swimming', 'Diving'] },
  { category: 'sport', pair: ['Boxing', 'Wrestling'] },
  { category: 'sport', pair: ['Golf', 'Cricket'] },
  { category: 'sport', pair: ['Basketball', 'Netball'] },
  { category: 'sport', pair: ['Cycling', 'Running'] },

  // Places
  { category: 'places', pair: ['Beach', 'Pool'] },
  { category: 'places', pair: ['Cinema', 'Theatre'] },
  { category: 'places', pair: ['Pub', 'Bar'] },
  { category: 'places', pair: ['Hotel', 'Hostel'] },
  { category: 'places', pair: ['Hospital', 'Clinic'] },
  { category: 'places', pair: ['School', 'College'] },
  { category: 'places', pair: ['Nightclub', 'Festival'] },
  { category: 'places', pair: ['Airport', 'Train Station'] },
  { category: 'places', pair: ['Gym', 'Sports Hall'] },
  { category: 'places', pair: ['Library', 'Museum'] },

  // Entertainment
  { category: 'entertainment', pair: ['TikTok', 'Instagram'] },
  { category: 'entertainment', pair: ['Netflix', 'Disney+'] },
  { category: 'entertainment', pair: ['Podcast', 'Radio'] },
  { category: 'entertainment', pair: ['Spotify', 'Apple Music'] },
  { category: 'entertainment', pair: ['YouTube', 'Twitch'] },
  { category: 'entertainment', pair: ['PlayStation', 'Xbox'] },
  { category: 'entertainment', pair: ['Concert', 'Rave'] },

  // Funny / Adult
  { category: 'funny', pair: ['Hangover', 'Food Poisoning'] },
  { category: 'funny', pair: ['Ex', 'Situationship'] },
  { category: 'funny', pair: ['Uber', 'Taxi'] },
  { category: 'funny', pair: ['Tinder', 'Hinge'] },
  { category: 'funny', pair: ['Takeaway', 'Drive Thru'] },
  { category: 'funny', pair: ['OnlyFans', 'Patreon'] },
  { category: 'funny', pair: ['Fart', 'Burp'] },
  { category: 'funny', pair: ['Fake Tan', 'Sun Bed'] },
  { category: 'funny', pair: ['Morning Breath', 'Garlic Breath'] },
  { category: 'funny', pair: ['Group Chat', 'WhatsApp'] },

  // General — included in All but not a specific filter
  { category: 'general', pair: ['Cat', 'Dog'] },
  { category: 'general', pair: ['Lion', 'Tiger'] },
  { category: 'general', pair: ['Dolphin', 'Shark'] },
  { category: 'general', pair: ['Horse', 'Donkey'] },
  { category: 'general', pair: ['Crocodile', 'Alligator'] },
  { category: 'general', pair: ['Shower', 'Bath'] },
  { category: 'general', pair: ['Dentist', 'Doctor'] },
  { category: 'general', pair: ['Alarm Clock', 'Lie In'] },
  { category: 'general', pair: ['Driving', 'Cycling'] },
  { category: 'general', pair: ['Landlord', 'Estate Agent'] },
];
