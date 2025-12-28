export type Familiarity = 'high' | 'medium' | 'low';
export type Category = 'politics' | 'science' | 'culture' | 'sports' | 'conflict' | 'economics';

export interface HistoricalEvent {
  id: string;
  event: string;
  year: number;
  fullDate: string;
  emoji: string;
  familiarity: Familiarity;
  category: Category;
  relatedGroup?: string;
}

// Each puzzle has 6 events - designed with temporal spread and familiarity balance
export const EVENTS: HistoricalEvent[] = [
  // Puzzle 1: 1986-1991 Mix (5 year span)
  { id: "challenger", event: "Challenger explosion", year: 1986, fullDate: "January 28, 1986", emoji: "🚀", familiarity: 'high', category: 'science', relatedGroup: 'space_shuttle' },
  { id: "chernobyl", event: "Chernobyl disaster", year: 1986, fullDate: "April 26, 1986", emoji: "☢️", familiarity: 'high', category: 'conflict' },
  { id: "maradona", event: "Hand of God goal", year: 1986, fullDate: "June 22, 1986", emoji: "⚽", familiarity: 'high', category: 'sports' },
  { id: "berlin", event: "Berlin Wall falls", year: 1989, fullDate: "November 9, 1989", emoji: "🧱", familiarity: 'high', category: 'politics', relatedGroup: 'berlin_wall' },
  { id: "mandela", event: "Mandela released from prison", year: 1990, fullDate: "February 11, 1990", emoji: "✊", familiarity: 'high', category: 'politics', relatedGroup: 'mandela' },
  { id: "nirvana", event: "Nevermind album released", year: 1991, fullDate: "September 24, 1991", emoji: "🎸", familiarity: 'medium', category: 'culture' },

  // Puzzle 2: 2007-2011 Mix (4 year span)
  { id: "iphone", event: "First iPhone released", year: 2007, fullDate: "June 29, 2007", emoji: "📱", familiarity: 'high', category: 'science' },
  { id: "obama", event: "Obama elected President", year: 2008, fullDate: "November 4, 2008", emoji: "🗳️", familiarity: 'high', category: 'politics' },
  { id: "bolt", event: "Bolt sets 100m world record", year: 2009, fullDate: "August 16, 2009", emoji: "🏃", familiarity: 'high', category: 'sports' },
  { id: "haiti", event: "Haiti earthquake", year: 2010, fullDate: "January 12, 2010", emoji: "🏚️", familiarity: 'medium', category: 'conflict' },
  { id: "binladen", event: "Bin Laden killed", year: 2011, fullDate: "May 2, 2011", emoji: "🎯", familiarity: 'high', category: 'conflict' },
  { id: "steve_jobs", event: "Steve Jobs dies", year: 2011, fullDate: "October 5, 2011", emoji: "🍎", familiarity: 'high', category: 'culture' },

  // Puzzle 3: 1997-2001 Mix (4 year span)
  { id: "diana", event: "Princess Diana dies", year: 1997, fullDate: "August 31, 1997", emoji: "🌹", familiarity: 'high', category: 'culture', relatedGroup: 'diana' },
  { id: "google", event: "Google founded", year: 1998, fullDate: "September 4, 1998", emoji: "🔍", familiarity: 'high', category: 'science' },
  { id: "columbine", event: "Columbine shooting", year: 1999, fullDate: "April 20, 1999", emoji: "💔", familiarity: 'high', category: 'conflict' },
  { id: "y2k", event: "Y2K midnight passes safely", year: 2000, fullDate: "January 1, 2000", emoji: "🎉", familiarity: 'high', category: 'science' },
  { id: "tiger_slam", event: "Tiger Woods completes Tiger Slam", year: 2001, fullDate: "April 8, 2001", emoji: "⛳", familiarity: 'medium', category: 'sports' },
  { id: "911", event: "9/11 attacks", year: 2001, fullDate: "September 11, 2001", emoji: "🏢", familiarity: 'high', category: 'conflict' },

  // Puzzle 4: 1963-1969 Mix (6 year span) - FIXED: Replaced mlk_death with cultural_rev
  { id: "mlk_dream", event: "I Have a Dream speech", year: 1963, fullDate: "August 28, 1963", emoji: "✊", familiarity: 'high', category: 'politics', relatedGroup: 'mlk' },
  { id: "jfk", event: "JFK assassinated", year: 1963, fullDate: "November 22, 1963", emoji: "🕯️", familiarity: 'high', category: 'politics', relatedGroup: 'kennedy' },
  { id: "beatles_usa", event: "Beatles arrive in USA", year: 1964, fullDate: "February 7, 1964", emoji: "🎸", familiarity: 'high', category: 'culture', relatedGroup: 'beatles' },
  { id: "england_wc", event: "England wins World Cup", year: 1966, fullDate: "July 30, 1966", emoji: "🏆", familiarity: 'high', category: 'sports' },
  { id: "cultural_rev", event: "Cultural Revolution begins", year: 1966, fullDate: "May 16, 1966", emoji: "🇨🇳", familiarity: 'medium', category: 'politics' },
  { id: "moon", event: "Moon landing", year: 1969, fullDate: "July 20, 1969", emoji: "🌙", familiarity: 'high', category: 'science' },

  // Puzzle 5: 2015-2020 Mix (5 year span)
  { id: "paris_attacks", event: "Paris terror attacks", year: 2015, fullDate: "November 13, 2015", emoji: "💔", familiarity: 'high', category: 'conflict' },
  { id: "leicester", event: "Leicester wins Premier League", year: 2016, fullDate: "May 2, 2016", emoji: "🦊", familiarity: 'high', category: 'sports' },
  { id: "trump", event: "Trump elected President", year: 2016, fullDate: "November 8, 2016", emoji: "🇺🇸", familiarity: 'high', category: 'politics', relatedGroup: 'trump' },
  { id: "metoo", event: "#MeToo movement begins", year: 2017, fullDate: "October 15, 2017", emoji: "✊", familiarity: 'high', category: 'culture' },
  { id: "notre_dame", event: "Notre-Dame fire", year: 2019, fullDate: "April 15, 2019", emoji: "🔥", familiarity: 'high', category: 'conflict' },
  { id: "covid", event: "COVID-19 pandemic declared", year: 2020, fullDate: "March 11, 2020", emoji: "🦠", familiarity: 'high', category: 'science', relatedGroup: 'covid' },

  // Puzzle 6: 1981-1986 Mix (5 year span)
  { id: "mtv", event: "MTV launches", year: 1981, fullDate: "August 1, 1981", emoji: "📺", familiarity: 'high', category: 'culture' },
  { id: "falklands", event: "Falklands War begins", year: 1982, fullDate: "April 2, 1982", emoji: "⚔️", familiarity: 'high', category: 'conflict' },
  { id: "thriller", event: "Thriller album released", year: 1982, fullDate: "November 30, 1982", emoji: "🎤", familiarity: 'high', category: 'culture' },
  { id: "macintosh", event: "First Macintosh released", year: 1984, fullDate: "January 24, 1984", emoji: "🖥️", familiarity: 'high', category: 'science' },
  { id: "liveaid", event: "Live Aid concert", year: 1985, fullDate: "July 13, 1985", emoji: "🎸", familiarity: 'high', category: 'culture' },
  { id: "shuttle", event: "First Space Shuttle launch", year: 1981, fullDate: "April 12, 1981", emoji: "🚀", familiarity: 'medium', category: 'science', relatedGroup: 'space_shuttle' },

  // Puzzle 7: 1972-1977 Mix (5 year span)
  { id: "watergate", event: "Watergate break-in", year: 1972, fullDate: "June 17, 1972", emoji: "📰", familiarity: 'high', category: 'politics', relatedGroup: 'nixon' },
  { id: "munich", event: "Munich Olympics massacre", year: 1972, fullDate: "September 5, 1972", emoji: "😢", familiarity: 'high', category: 'conflict' },
  { id: "rumble", event: "Rumble in the Jungle", year: 1974, fullDate: "October 30, 1974", emoji: "🥊", familiarity: 'high', category: 'sports' },
  { id: "saigon", event: "Fall of Saigon", year: 1975, fullDate: "April 30, 1975", emoji: "🚁", familiarity: 'high', category: 'conflict' },
  { id: "apple", event: "Apple Computer founded", year: 1976, fullDate: "April 1, 1976", emoji: "🍎", familiarity: 'high', category: 'science' },
  { id: "starwars", event: "Star Wars released", year: 1977, fullDate: "May 25, 1977", emoji: "⭐", familiarity: 'high', category: 'culture' },

  // Puzzle 8: 2003-2008 Mix (5 year span)
  { id: "iraq", event: "Iraq War begins", year: 2003, fullDate: "March 20, 2003", emoji: "⚔️", familiarity: 'high', category: 'conflict' },
  { id: "facebook", event: "Facebook launches", year: 2004, fullDate: "February 4, 2004", emoji: "👤", familiarity: 'high', category: 'science' },
  { id: "youtube", event: "YouTube launches", year: 2005, fullDate: "February 14, 2005", emoji: "▶️", familiarity: 'high', category: 'science' },
  { id: "twitter", event: "Twitter launches", year: 2006, fullDate: "July 15, 2006", emoji: "🐦", familiarity: 'high', category: 'science' },
  { id: "zidane", event: "Zidane headbutt in World Cup final", year: 2006, fullDate: "July 9, 2006", emoji: "🤕", familiarity: 'high', category: 'sports' },
  { id: "lehman", event: "Lehman Brothers collapses", year: 2008, fullDate: "September 15, 2008", emoji: "🏦", familiarity: 'high', category: 'economics' },

  // Puzzle 9: 1993-1997 Mix (4 year span)
  { id: "jurassic", event: "Jurassic Park released", year: 1993, fullDate: "June 11, 1993", emoji: "🦖", familiarity: 'high', category: 'culture' },
  { id: "channel", event: "Channel Tunnel opens", year: 1994, fullDate: "May 6, 1994", emoji: "🚄", familiarity: 'high', category: 'science' },
  { id: "oj", event: "OJ Simpson verdict", year: 1995, fullDate: "October 3, 1995", emoji: "⚖️", familiarity: 'high', category: 'politics' },
  { id: "dolly", event: "Dolly the sheep cloned", year: 1996, fullDate: "July 5, 1996", emoji: "🐑", familiarity: 'high', category: 'science' },
  { id: "hong_kong", event: "Hong Kong handover to China", year: 1997, fullDate: "July 1, 1997", emoji: "🇭🇰", familiarity: 'medium', category: 'politics' },
  { id: "titanic_film", event: "Titanic film released", year: 1997, fullDate: "December 19, 1997", emoji: "🚢", familiarity: 'high', category: 'culture', relatedGroup: 'titanic' },

  // Puzzle 10: 1984-1997 Mix (13 year span) - FIXED: Expanded temporal spread
  { id: "band_aid", event: "Band Aid single released", year: 1984, fullDate: "November 25, 1984", emoji: "🎵", familiarity: 'high', category: 'culture' },
  { id: "tiananmen", event: "Tiananmen Square protests", year: 1989, fullDate: "June 4, 1989", emoji: "🕯️", familiarity: 'high', category: 'conflict' },
  { id: "ussr", event: "Soviet Union dissolves", year: 1991, fullDate: "December 26, 1991", emoji: "🇷🇺", familiarity: 'high', category: 'politics' },
  { id: "rwandagenocide", event: "Rwanda genocide begins", year: 1994, fullDate: "April 7, 1994", emoji: "💔", familiarity: 'high', category: 'conflict' },
  { id: "deep_blue", event: "Deep Blue beats Kasparov", year: 1997, fullDate: "May 11, 1997", emoji: "♟️", familiarity: 'medium', category: 'science' },
  { id: "pathfinder", event: "Mars Pathfinder lands", year: 1997, fullDate: "July 4, 1997", emoji: "🚀", familiarity: 'medium', category: 'science' },

  // Puzzle 11: 2011-2016 Mix (5 year span)
  { id: "fukushima", event: "Fukushima nuclear disaster", year: 2011, fullDate: "March 12, 2011", emoji: "☢️", familiarity: 'high', category: 'conflict' },
  { id: "william_kate", event: "William & Kate wed", year: 2011, fullDate: "April 29, 2011", emoji: "💍", familiarity: 'high', category: 'culture', relatedGroup: 'royals' },
  { id: "curiosity", event: "Curiosity lands on Mars", year: 2012, fullDate: "August 6, 2012", emoji: "🚀", familiarity: 'medium', category: 'science' },
  { id: "boston", event: "Boston Marathon bombing", year: 2013, fullDate: "April 15, 2013", emoji: "💔", familiarity: 'high', category: 'conflict' },
  { id: "scotland", event: "Scottish independence vote", year: 2014, fullDate: "September 18, 2014", emoji: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", familiarity: 'medium', category: 'politics' },
  { id: "brexit", event: "Brexit referendum", year: 2016, fullDate: "June 23, 2016", emoji: "🇬🇧", familiarity: 'high', category: 'politics' },

  // Puzzle 12: 1957-1963 Mix (6 year span)
  { id: "sputnik", event: "Sputnik launched", year: 1957, fullDate: "October 4, 1957", emoji: "🛰️", familiarity: 'high', category: 'science' },
  { id: "castro", event: "Castro takes power in Cuba", year: 1959, fullDate: "January 1, 1959", emoji: "🇨🇺", familiarity: 'high', category: 'politics' },
  { id: "berlin_wall", event: "Berlin Wall built", year: 1961, fullDate: "August 13, 1961", emoji: "🧱", familiarity: 'high', category: 'politics', relatedGroup: 'berlin_wall' },
  { id: "gagarin", event: "Gagarin first human in space", year: 1961, fullDate: "April 12, 1961", emoji: "👨‍🚀", familiarity: 'high', category: 'science' },
  { id: "cuban", event: "Cuban Missile Crisis", year: 1962, fullDate: "October 16, 1962", emoji: "☢️", familiarity: 'high', category: 'conflict' },
  { id: "marilyn", event: "Marilyn Monroe dies", year: 1962, fullDate: "August 4, 1962", emoji: "💔", familiarity: 'high', category: 'culture' },

  // Puzzle 13: 2019-2023 Mix (4 year span)
  { id: "area51", event: "Storm Area 51 event", year: 2019, fullDate: "September 20, 2019", emoji: "👽", familiarity: 'medium', category: 'culture' },
  { id: "kobe", event: "Kobe Bryant dies", year: 2020, fullDate: "January 26, 2020", emoji: "🏀", familiarity: 'high', category: 'sports' },
  { id: "floyd", event: "George Floyd protests begin", year: 2020, fullDate: "May 26, 2020", emoji: "✊", familiarity: 'high', category: 'politics' },
  { id: "capitol", event: "Capitol riot", year: 2021, fullDate: "January 6, 2021", emoji: "🏛️", familiarity: 'high', category: 'politics' },
  { id: "queen", event: "Queen Elizabeth II dies", year: 2022, fullDate: "September 8, 2022", emoji: "👑", familiarity: 'high', category: 'politics', relatedGroup: 'royals' },
  { id: "chatgpt", event: "ChatGPT launches", year: 2022, fullDate: "November 30, 2022", emoji: "🤖", familiarity: 'high', category: 'science' },

  // Puzzle 14: 1929-1937 Mix (8 year span)
  { id: "crash", event: "Wall Street Crash", year: 1929, fullDate: "October 29, 1929", emoji: "📉", familiarity: 'high', category: 'economics' },
  { id: "empire", event: "Empire State Building opens", year: 1931, fullDate: "May 1, 1931", emoji: "🏙️", familiarity: 'high', category: 'culture' },
  { id: "hitler", event: "Hitler becomes Chancellor", year: 1933, fullDate: "January 30, 1933", emoji: "⚠️", familiarity: 'high', category: 'politics' },
  { id: "jesse", event: "Jesse Owens wins 4 golds", year: 1936, fullDate: "August 9, 1936", emoji: "🏅", familiarity: 'high', category: 'sports' },
  { id: "hindenburg", event: "Hindenburg disaster", year: 1937, fullDate: "May 6, 1937", emoji: "🎈", familiarity: 'high', category: 'conflict' },
  { id: "amelia", event: "Amelia Earhart disappears", year: 1937, fullDate: "July 2, 1937", emoji: "✈️", familiarity: 'high', category: 'culture' },

  // Puzzle 15: 2000-2005 Mix (5 year span)
  { id: "bush_gore", event: "Bush v Gore decided", year: 2000, fullDate: "December 12, 2000", emoji: "⚖️", familiarity: 'high', category: 'politics' },
  { id: "ipod", event: "iPod released", year: 2001, fullDate: "October 23, 2001", emoji: "🎵", familiarity: 'high', category: 'science' },
  { id: "euro_coins", event: "Euro coins enter circulation", year: 2002, fullDate: "January 1, 2002", emoji: "💶", familiarity: 'medium', category: 'economics', relatedGroup: 'euro' },
  { id: "columbia", event: "Columbia disaster", year: 2003, fullDate: "February 1, 2003", emoji: "🚀", familiarity: 'high', category: 'science', relatedGroup: 'space_shuttle' },
  { id: "tsunami", event: "Indian Ocean tsunami", year: 2004, fullDate: "December 26, 2004", emoji: "🌊", familiarity: 'high', category: 'conflict' },
  { id: "katrina", event: "Hurricane Katrina", year: 2005, fullDate: "August 29, 2005", emoji: "🌀", familiarity: 'high', category: 'conflict' },

  // Puzzle 16: 1941-1947 Mix (6 year span)
  { id: "pearl", event: "Pearl Harbor attack", year: 1941, fullDate: "December 7, 1941", emoji: "⚔️", familiarity: 'high', category: 'conflict' },
  { id: "dday", event: "D-Day invasion", year: 1944, fullDate: "June 6, 1944", emoji: "🪖", familiarity: 'high', category: 'conflict' },
  { id: "hiroshima", event: "Hiroshima bombing", year: 1945, fullDate: "August 6, 1945", emoji: "💣", familiarity: 'high', category: 'conflict' },
  { id: "un", event: "United Nations founded", year: 1945, fullDate: "October 24, 1945", emoji: "🌐", familiarity: 'high', category: 'politics' },
  { id: "nuremberg", event: "Nuremberg trials begin", year: 1945, fullDate: "November 20, 1945", emoji: "⚖️", familiarity: 'high', category: 'politics' },
  { id: "india", event: "India gains independence", year: 1947, fullDate: "August 15, 1947", emoji: "🇮🇳", familiarity: 'high', category: 'politics' },

  // Puzzle 17: 1912-1918 Mix (6 year span)
  { id: "titanic", event: "Titanic sinks", year: 1912, fullDate: "April 15, 1912", emoji: "🚢", familiarity: 'high', category: 'conflict', relatedGroup: 'titanic' },
  { id: "archduke", event: "Archduke Franz Ferdinand assassinated", year: 1914, fullDate: "June 28, 1914", emoji: "💀", familiarity: 'high', category: 'conflict' },
  { id: "lusitania", event: "Lusitania sinks", year: 1915, fullDate: "May 7, 1915", emoji: "🚢", familiarity: 'medium', category: 'conflict' },
  { id: "easter", event: "Easter Rising in Ireland", year: 1916, fullDate: "April 24, 1916", emoji: "🇮🇪", familiarity: 'medium', category: 'conflict' },
  { id: "russian", event: "Russian Revolution", year: 1917, fullDate: "November 7, 1917", emoji: "🇷🇺", familiarity: 'high', category: 'politics' },
  { id: "spanish_flu", event: "Spanish Flu pandemic begins", year: 1918, fullDate: "March 1918", emoji: "🦠", familiarity: 'high', category: 'science' },

  // Puzzle 18: 1979-1984 Mix (5 year span)
  { id: "thatcher", event: "Thatcher becomes PM", year: 1979, fullDate: "May 4, 1979", emoji: "🇬🇧", familiarity: 'high', category: 'politics' },
  { id: "lennon", event: "John Lennon assassinated", year: 1980, fullDate: "December 8, 1980", emoji: "🎵", familiarity: 'high', category: 'culture', relatedGroup: 'beatles' },
  { id: "charles_diana", event: "Charles & Diana wed", year: 1981, fullDate: "July 29, 1981", emoji: "💒", familiarity: 'high', category: 'culture', relatedGroup: 'diana' },
  { id: "pacman", event: "Pac-Man released", year: 1980, fullDate: "May 22, 1980", emoji: "👾", familiarity: 'high', category: 'culture' },
  { id: "et", event: "E.T. film released", year: 1982, fullDate: "June 11, 1982", emoji: "👽", familiarity: 'high', category: 'culture' },
  { id: "brighton", event: "Brighton hotel bombing", year: 1984, fullDate: "October 12, 1984", emoji: "💣", familiarity: 'medium', category: 'conflict' },

  // Puzzle 19: 1994-1999 Mix (5 year span)
  { id: "mandela_pres", event: "Mandela becomes President", year: 1994, fullDate: "May 10, 1994", emoji: "✊", familiarity: 'high', category: 'politics', relatedGroup: 'mandela' },
  { id: "cobain", event: "Kurt Cobain dies", year: 1994, fullDate: "April 5, 1994", emoji: "🎸", familiarity: 'high', category: 'culture' },
  { id: "oklahoma", event: "Oklahoma City bombing", year: 1995, fullDate: "April 19, 1995", emoji: "💔", familiarity: 'high', category: 'conflict' },
  { id: "spice", event: "Wannabe released", year: 1996, fullDate: "July 8, 1996", emoji: "✌️", familiarity: 'medium', category: 'culture' },
  { id: "matrix", event: "The Matrix released", year: 1999, fullDate: "March 31, 1999", emoji: "💊", familiarity: 'high', category: 'culture' },
  { id: "euro", event: "Euro currency launches", year: 1999, fullDate: "January 1, 1999", emoji: "💶", familiarity: 'medium', category: 'economics', relatedGroup: 'euro' },

  // Puzzle 20: 2008-2013 Mix (5 year span)
  { id: "beijing", event: "Beijing Olympics", year: 2008, fullDate: "August 8, 2008", emoji: "🇨🇳", familiarity: 'high', category: 'sports' },
  { id: "bitcoin", event: "Bitcoin created", year: 2009, fullDate: "January 3, 2009", emoji: "₿", familiarity: 'high', category: 'economics' },
  { id: "instagram", event: "Instagram launches", year: 2010, fullDate: "October 6, 2010", emoji: "📷", familiarity: 'high', category: 'science' },
  { id: "arab_spring", event: "Arab Spring begins", year: 2010, fullDate: "December 17, 2010", emoji: "🔥", familiarity: 'high', category: 'politics' },
  { id: "gangnam", event: "Gangnam Style goes viral", year: 2012, fullDate: "July 15, 2012", emoji: "🕺", familiarity: 'high', category: 'culture' },
  { id: "snowden", event: "Snowden leaks NSA files", year: 2013, fullDate: "June 5, 2013", emoji: "📁", familiarity: 'high', category: 'politics' },

  // Puzzle 21: 1968-1973 Mix (5 year span)
  { id: "rfk", event: "RFK assassinated", year: 1968, fullDate: "June 6, 1968", emoji: "🕯️", familiarity: 'high', category: 'politics', relatedGroup: 'kennedy' },
  { id: "woodstock", event: "Woodstock festival", year: 1969, fullDate: "August 15, 1969", emoji: "🎸", familiarity: 'high', category: 'culture' },
  { id: "apollo13", event: "Apollo 13 crisis", year: 1970, fullDate: "April 11, 1970", emoji: "🚀", familiarity: 'high', category: 'science' },
  { id: "intel", event: "First Intel microprocessor", year: 1971, fullDate: "November 15, 1971", emoji: "💾", familiarity: 'low', category: 'science' },
  { id: "nixon_china", event: "Nixon visits China", year: 1972, fullDate: "February 21, 1972", emoji: "🇨🇳", familiarity: 'medium', category: 'politics', relatedGroup: 'nixon' },
  { id: "roe", event: "Roe v Wade decided", year: 1973, fullDate: "January 22, 1973", emoji: "⚖️", familiarity: 'high', category: 'politics' },

  // Puzzle 22: 1987-1992 Mix (5 year span)
  { id: "blackmonday", event: "Black Monday crash", year: 1987, fullDate: "October 19, 1987", emoji: "📉", familiarity: 'medium', category: 'economics' },
  { id: "lockerbie", event: "Lockerbie bombing", year: 1988, fullDate: "December 21, 1988", emoji: "✈️", familiarity: 'high', category: 'conflict' },
  { id: "gameboy", event: "Game Boy released", year: 1989, fullDate: "April 21, 1989", emoji: "🎮", familiarity: 'high', category: 'culture' },
  { id: "simpsons", event: "The Simpsons premieres", year: 1989, fullDate: "December 17, 1989", emoji: "📺", familiarity: 'high', category: 'culture' },
  { id: "gulf", event: "Gulf War begins", year: 1991, fullDate: "January 17, 1991", emoji: "⚔️", familiarity: 'high', category: 'conflict' },
  { id: "freddie", event: "Freddie Mercury dies", year: 1991, fullDate: "November 24, 1991", emoji: "👑", familiarity: 'high', category: 'culture' },

  // Puzzle 23: 1950-1955 Mix (5 year span)
  { id: "korean", event: "Korean War begins", year: 1950, fullDate: "June 25, 1950", emoji: "⚔️", familiarity: 'high', category: 'conflict' },
  { id: "everest", event: "Everest first summited", year: 1953, fullDate: "May 29, 1953", emoji: "🏔️", familiarity: 'high', category: 'sports' },
  { id: "dna", event: "DNA structure discovered", year: 1953, fullDate: "April 25, 1953", emoji: "🧬", familiarity: 'high', category: 'science' },
  { id: "queen_coronation", event: "Queen Elizabeth II coronation", year: 1953, fullDate: "June 2, 1953", emoji: "👑", familiarity: 'high', category: 'politics', relatedGroup: 'royals' },
  { id: "disneyland", event: "Disneyland opens", year: 1955, fullDate: "July 17, 1955", emoji: "🏰", familiarity: 'high', category: 'culture' },
  { id: "rosa", event: "Rosa Parks refuses to give up seat", year: 1955, fullDate: "December 1, 1955", emoji: "✊", familiarity: 'high', category: 'politics' },

  // Puzzle 24: 2013-2018 Mix (5 year span)
  { id: "pope_francis", event: "Pope Francis elected", year: 2013, fullDate: "March 13, 2013", emoji: "⛪", familiarity: 'high', category: 'culture' },
  { id: "mh370", event: "Malaysia Airlines MH370 disappears", year: 2014, fullDate: "March 8, 2014", emoji: "✈️", familiarity: 'high', category: 'conflict' },
  { id: "paris_climate", event: "Paris Climate Agreement", year: 2015, fullDate: "December 12, 2015", emoji: "🌍", familiarity: 'medium', category: 'politics' },
  { id: "bowie", event: "David Bowie dies", year: 2016, fullDate: "January 10, 2016", emoji: "⭐", familiarity: 'high', category: 'culture' },
  { id: "eclipse", event: "Great American Eclipse", year: 2017, fullDate: "August 21, 2017", emoji: "🌑", familiarity: 'medium', category: 'science' },
  { id: "tiktok", event: "TikTok launches globally", year: 2018, fullDate: "August 2, 2018", emoji: "🎵", familiarity: 'high', category: 'science' },

  // Puzzle 25: 1999-2004 Mix (5 year span)
  { id: "millennium", event: "Millennium celebrations", year: 2000, fullDate: "January 1, 2000", emoji: "🎉", familiarity: 'high', category: 'culture' },
  { id: "dotcom", event: "Dotcom bubble bursts", year: 2000, fullDate: "March 10, 2000", emoji: "💻", familiarity: 'high', category: 'economics' },
  { id: "wiki", event: "Wikipedia launches", year: 2001, fullDate: "January 15, 2001", emoji: "📖", familiarity: 'high', category: 'science' },
  { id: "lotr", event: "Lord of the Rings: Fellowship released", year: 2001, fullDate: "December 19, 2001", emoji: "💍", familiarity: 'high', category: 'culture' },
  { id: "myspace", event: "MySpace launches", year: 2003, fullDate: "August 1, 2003", emoji: "👤", familiarity: 'medium', category: 'science' },
  { id: "athens", event: "Athens Olympics", year: 2004, fullDate: "August 13, 2004", emoji: "🏅", familiarity: 'medium', category: 'sports' },

  // Puzzle 26: 1920-1928 Mix (8 year span)
  { id: "suffrage", event: "Women win right to vote (US)", year: 1920, fullDate: "August 18, 1920", emoji: "🗳️", familiarity: 'high', category: 'politics' },
  { id: "tutankhamun", event: "Tutankhamun's tomb discovered", year: 1922, fullDate: "November 4, 1922", emoji: "🏺", familiarity: 'high', category: 'science' },
  { id: "scopes", event: "Scopes Monkey Trial", year: 1925, fullDate: "July 21, 1925", emoji: "🐒", familiarity: 'medium', category: 'politics' },
  { id: "tv_baird", event: "First television demonstrated", year: 1926, fullDate: "January 26, 1926", emoji: "📺", familiarity: 'medium', category: 'science' },
  { id: "lindbergh", event: "Lindbergh crosses Atlantic solo", year: 1927, fullDate: "May 21, 1927", emoji: "✈️", familiarity: 'high', category: 'science' },
  { id: "mickey", event: "Mickey Mouse debuts", year: 1928, fullDate: "November 18, 1928", emoji: "🐭", familiarity: 'high', category: 'culture' },

  // Puzzle 27: 1938-1945 Mix (7 year span)
  { id: "kristallnacht", event: "Kristallnacht", year: 1938, fullDate: "November 9, 1938", emoji: "💔", familiarity: 'high', category: 'conflict' },
  { id: "ww2_start", event: "World War II begins", year: 1939, fullDate: "September 1, 1939", emoji: "⚔️", familiarity: 'high', category: 'conflict' },
  { id: "wizard_oz", event: "Wizard of Oz released", year: 1939, fullDate: "August 25, 1939", emoji: "🌈", familiarity: 'high', category: 'culture' },
  { id: "midway", event: "Battle of Midway", year: 1942, fullDate: "June 4, 1942", emoji: "⚓", familiarity: 'medium', category: 'conflict' },
  { id: "anne_frank", event: "Anne Frank captured", year: 1944, fullDate: "August 4, 1944", emoji: "📔", familiarity: 'high', category: 'conflict' },
  { id: "ve_day", event: "VE Day - Victory in Europe", year: 1945, fullDate: "May 8, 1945", emoji: "🎉", familiarity: 'high', category: 'conflict' },

  // Puzzle 28: 1946-1952 Mix (6 year span)
  { id: "eniac", event: "ENIAC computer unveiled", year: 1946, fullDate: "February 14, 1946", emoji: "🖥️", familiarity: 'medium', category: 'science' },
  { id: "israel", event: "Israel declares independence", year: 1948, fullDate: "May 14, 1948", emoji: "🇮🇱", familiarity: 'high', category: 'politics' },
  { id: "gandhi_death", event: "Gandhi assassinated", year: 1948, fullDate: "January 30, 1948", emoji: "🕯️", familiarity: 'high', category: 'politics' },
  { id: "nato", event: "NATO founded", year: 1949, fullDate: "April 4, 1949", emoji: "🤝", familiarity: 'high', category: 'politics' },
  { id: "china_prc", event: "Mao declares People's Republic", year: 1949, fullDate: "October 1, 1949", emoji: "🇨🇳", familiarity: 'high', category: 'politics' },
  { id: "color_tv", event: "Color TV broadcasts begin", year: 1951, fullDate: "June 25, 1951", emoji: "📺", familiarity: 'medium', category: 'science' },

  // Puzzle 29: 1954-1960 Mix (6 year span)
  { id: "brown_v_board", event: "Brown v Board of Education", year: 1954, fullDate: "May 17, 1954", emoji: "⚖️", familiarity: 'high', category: 'politics' },
  { id: "bannister", event: "Roger Bannister breaks 4-minute mile", year: 1954, fullDate: "May 6, 1954", emoji: "🏃", familiarity: 'high', category: 'sports' },
  { id: "elvis_sullivan", event: "Elvis on Ed Sullivan Show", year: 1956, fullDate: "September 9, 1956", emoji: "🎤", familiarity: 'high', category: 'culture' },
  { id: "suez", event: "Suez Crisis begins", year: 1956, fullDate: "October 29, 1956", emoji: "🚢", familiarity: 'medium', category: 'conflict' },
  { id: "nasa", event: "NASA founded", year: 1958, fullDate: "July 29, 1958", emoji: "🚀", familiarity: 'high', category: 'science' },
  { id: "jfk_elected", event: "JFK elected President", year: 1960, fullDate: "November 8, 1960", emoji: "🇺🇸", familiarity: 'high', category: 'politics', relatedGroup: 'kennedy' },

  // Puzzle 30: 1965-1970 Mix (5 year span) - FIXED: Added mlk_death, removed earth_day
  { id: "malcolm_x", event: "Malcolm X assassinated", year: 1965, fullDate: "February 21, 1965", emoji: "🕯️", familiarity: 'high', category: 'politics' },
  { id: "voting_rights", event: "Voting Rights Act signed", year: 1965, fullDate: "August 6, 1965", emoji: "✊", familiarity: 'high', category: 'politics' },
  { id: "six_day", event: "Six-Day War", year: 1967, fullDate: "June 5, 1967", emoji: "⚔️", familiarity: 'medium', category: 'conflict' },
  { id: "summer_love", event: "Summer of Love", year: 1967, fullDate: "June 1, 1967", emoji: "✌️", familiarity: 'medium', category: 'culture' },
  { id: "mlk_death", event: "MLK assassinated", year: 1968, fullDate: "April 4, 1968", emoji: "🕯️", familiarity: 'high', category: 'politics', relatedGroup: 'mlk' },
  { id: "kent_state", event: "Kent State shooting", year: 1970, fullDate: "May 4, 1970", emoji: "💔", familiarity: 'medium', category: 'conflict' },

  // Puzzle 31: 1973-1978 Mix (5 year span)
  { id: "oil_crisis", event: "Oil Crisis begins", year: 1973, fullDate: "October 17, 1973", emoji: "⛽", familiarity: 'medium', category: 'economics' },
  { id: "nixon", event: "Nixon resigns", year: 1974, fullDate: "August 9, 1974", emoji: "🇺🇸", familiarity: 'high', category: 'politics', relatedGroup: 'nixon' },
  { id: "microsoft", event: "Microsoft founded", year: 1975, fullDate: "April 4, 1975", emoji: "💻", familiarity: 'high', category: 'science' },
  { id: "concorde", event: "Concorde begins commercial flights", year: 1976, fullDate: "January 21, 1976", emoji: "✈️", familiarity: 'high', category: 'science', relatedGroup: 'concorde' },
  { id: "elvis_dies", event: "Elvis Presley dies", year: 1977, fullDate: "August 16, 1977", emoji: "👑", familiarity: 'high', category: 'culture' },
  { id: "test_tube", event: "First test tube baby born", year: 1978, fullDate: "July 25, 1978", emoji: "👶", familiarity: 'high', category: 'science' },

  // Puzzle 32: 1981-1986 Mix (5 year span)
  { id: "aids", event: "First AIDS cases reported", year: 1981, fullDate: "June 5, 1981", emoji: "🎗️", familiarity: 'high', category: 'science' },
  { id: "reagan_shot", event: "Reagan assassination attempt", year: 1981, fullDate: "March 30, 1981", emoji: "🏥", familiarity: 'medium', category: 'politics' },
  { id: "mash_finale", event: "M*A*S*H finale airs", year: 1983, fullDate: "February 28, 1983", emoji: "📺", familiarity: 'medium', category: 'culture' },
  { id: "bhopal", event: "Bhopal disaster", year: 1984, fullDate: "December 3, 1984", emoji: "☠️", familiarity: 'medium', category: 'conflict' },
  { id: "ozone", event: "Ozone hole discovered", year: 1985, fullDate: "May 16, 1985", emoji: "🌍", familiarity: 'medium', category: 'science' },
  { id: "hands_america", event: "Hands Across America", year: 1986, fullDate: "May 25, 1986", emoji: "🤝", familiarity: 'low', category: 'culture' },

  // Puzzle 33: 1988-1993 Mix (5 year span)
  { id: "seoul", event: "Seoul Olympics", year: 1988, fullDate: "September 17, 1988", emoji: "🏅", familiarity: 'medium', category: 'sports' },
  { id: "pan_am", event: "Pan Am Flight 103 bombing", year: 1988, fullDate: "December 21, 1988", emoji: "✈️", familiarity: 'medium', category: 'conflict' },
  { id: "www", event: "World Wide Web invented", year: 1989, fullDate: "March 12, 1989", emoji: "🌐", familiarity: 'high', category: 'science' },
  { id: "barcelona", event: "Barcelona Olympics", year: 1992, fullDate: "July 25, 1992", emoji: "🏅", familiarity: 'medium', category: 'sports' },
  { id: "waco", event: "Waco siege ends", year: 1993, fullDate: "April 19, 1993", emoji: "🔥", familiarity: 'medium', category: 'conflict' },
  { id: "oslo", event: "Oslo Accords signed", year: 1993, fullDate: "September 13, 1993", emoji: "🕊️", familiarity: 'medium', category: 'politics' },

  // Puzzle 34: 1995-2000 Mix (5 year span) - Events moved to Puzzle 10 replaced
  { id: "ebay", event: "eBay founded", year: 1995, fullDate: "September 3, 1995", emoji: "🛒", familiarity: 'high', category: 'economics' },
  { id: "atlanta", event: "Atlanta Olympics bombing", year: 1996, fullDate: "July 27, 1996", emoji: "💣", familiarity: 'medium', category: 'conflict' },
  { id: "biggie", event: "Notorious B.I.G. shot", year: 1997, fullDate: "March 9, 1997", emoji: "🎤", familiarity: 'medium', category: 'culture' },
  { id: "clinton_impeach", event: "Clinton impeached", year: 1998, fullDate: "December 19, 1998", emoji: "⚖️", familiarity: 'high', category: 'politics', relatedGroup: 'clinton' },
  { id: "napster", event: "Napster launches", year: 1999, fullDate: "June 1, 1999", emoji: "🎵", familiarity: 'high', category: 'science' },
  { id: "sydney", event: "Sydney Olympics", year: 2000, fullDate: "September 15, 2000", emoji: "🏅", familiarity: 'medium', category: 'sports' },

  // Puzzle 35: 2003-2009 Mix (6 year span)
  { id: "genome", event: "Human Genome Project completed", year: 2003, fullDate: "April 14, 2003", emoji: "🧬", familiarity: 'medium', category: 'science' },
  { id: "space_tourism", event: "SpaceShipOne wins X Prize", year: 2004, fullDate: "October 4, 2004", emoji: "🚀", familiarity: 'low', category: 'science' },
  { id: "london_bombing", event: "7/7 London bombings", year: 2005, fullDate: "July 7, 2005", emoji: "💔", familiarity: 'high', category: 'conflict' },
  { id: "pluto", event: "Pluto demoted to dwarf planet", year: 2006, fullDate: "August 24, 2006", emoji: "🪐", familiarity: 'high', category: 'science' },
  { id: "virginia_tech", event: "Virginia Tech shooting", year: 2007, fullDate: "April 16, 2007", emoji: "💔", familiarity: 'medium', category: 'conflict' },
  { id: "mj_dies", event: "Michael Jackson dies", year: 2009, fullDate: "June 25, 2009", emoji: "🎤", familiarity: 'high', category: 'culture' },

  // Puzzle 36: 2010-2015 Mix (5 year span)
  { id: "deepwater", event: "Deepwater Horizon explosion", year: 2010, fullDate: "April 20, 2010", emoji: "🛢️", familiarity: 'high', category: 'conflict' },
  { id: "amy", event: "Amy Winehouse dies", year: 2011, fullDate: "July 23, 2011", emoji: "🎤", familiarity: 'high', category: 'culture' },
  { id: "london_olympics", event: "London Olympics", year: 2012, fullDate: "July 27, 2012", emoji: "🏅", familiarity: 'high', category: 'sports' },
  { id: "sandy_hook", event: "Sandy Hook shooting", year: 2012, fullDate: "December 14, 2012", emoji: "💔", familiarity: 'high', category: 'conflict' },
  { id: "higgs", event: "Higgs boson discovered", year: 2012, fullDate: "July 4, 2012", emoji: "⚛️", familiarity: 'medium', category: 'science' },
  { id: "mandela_dies", event: "Nelson Mandela dies", year: 2013, fullDate: "December 5, 2013", emoji: "✊", familiarity: 'high', category: 'politics', relatedGroup: 'mandela' },

  // Puzzle 37: 2014-2019 Mix (5 year span)
  { id: "ice_bucket", event: "Ice Bucket Challenge goes viral", year: 2014, fullDate: "July 15, 2014", emoji: "🧊", familiarity: 'high', category: 'culture' },
  { id: "philae", event: "Philae lands on comet", year: 2014, fullDate: "November 12, 2014", emoji: "☄️", familiarity: 'medium', category: 'science' },
  { id: "nepal", event: "Nepal earthquake", year: 2015, fullDate: "April 25, 2015", emoji: "🏔️", familiarity: 'medium', category: 'conflict' },
  { id: "same_sex_us", event: "Same-sex marriage legalized (US)", year: 2015, fullDate: "June 26, 2015", emoji: "🏳️‍🌈", familiarity: 'high', category: 'politics' },
  { id: "harambe", event: "Harambe killed at zoo", year: 2016, fullDate: "May 28, 2016", emoji: "🦍", familiarity: 'high', category: 'culture' },
  { id: "greta", event: "Greta Thunberg begins climate strike", year: 2018, fullDate: "August 20, 2018", emoji: "🌍", familiarity: 'high', category: 'politics' },

  // Puzzle 38: 2017-2022 Mix (5 year span)
  { id: "vegas_shooting", event: "Las Vegas mass shooting", year: 2017, fullDate: "October 1, 2017", emoji: "💔", familiarity: 'high', category: 'conflict' },
  { id: "hawking", event: "Stephen Hawking dies", year: 2018, fullDate: "March 14, 2018", emoji: "🌌", familiarity: 'high', category: 'science' },
  { id: "thai_cave", event: "Thai cave rescue", year: 2018, fullDate: "July 10, 2018", emoji: "⛰️", familiarity: 'high', category: 'conflict' },
  { id: "hong_kong_protests", event: "Hong Kong protests begin", year: 2019, fullDate: "March 31, 2019", emoji: "🇭🇰", familiarity: 'high', category: 'politics' },
  { id: "beirut", event: "Beirut port explosion", year: 2020, fullDate: "August 4, 2020", emoji: "💥", familiarity: 'high', category: 'conflict' },
  { id: "suez_block", event: "Ever Given blocks Suez Canal", year: 2021, fullDate: "March 23, 2021", emoji: "🚢", familiarity: 'high', category: 'economics' },

  // Puzzle 39: 2020-2024 Mix (4 year span)
  { id: "vaccine", event: "First COVID vaccine approved", year: 2020, fullDate: "December 11, 2020", emoji: "💉", familiarity: 'high', category: 'science', relatedGroup: 'covid' },
  { id: "bezos_space", event: "Bezos goes to space", year: 2021, fullDate: "July 20, 2021", emoji: "🚀", familiarity: 'medium', category: 'science' },
  { id: "ukraine", event: "Russia invades Ukraine", year: 2022, fullDate: "February 24, 2022", emoji: "🇺🇦", familiarity: 'high', category: 'conflict' },
  { id: "pelosi_taiwan", event: "Pelosi visits Taiwan", year: 2022, fullDate: "August 2, 2022", emoji: "🇹🇼", familiarity: 'medium', category: 'politics' },
  { id: "svb", event: "Silicon Valley Bank collapses", year: 2023, fullDate: "March 10, 2023", emoji: "🏦", familiarity: 'medium', category: 'economics' },
  { id: "coronation", event: "King Charles III coronation", year: 2023, fullDate: "May 6, 2023", emoji: "👑", familiarity: 'high', category: 'culture', relatedGroup: 'royals' },

  // Puzzle 40: 1932-1938 Mix (6 year span)
  { id: "fdr", event: "FDR elected President", year: 1932, fullDate: "November 8, 1932", emoji: "🇺🇸", familiarity: 'high', category: 'politics' },
  { id: "alcatraz", event: "Alcatraz becomes federal prison", year: 1934, fullDate: "August 11, 1934", emoji: "🔒", familiarity: 'medium', category: 'politics' },
  { id: "bonnie_clyde", event: "Bonnie and Clyde killed", year: 1934, fullDate: "May 23, 1934", emoji: "🔫", familiarity: 'high', category: 'conflict' },
  { id: "social_security", event: "Social Security Act signed", year: 1935, fullDate: "August 14, 1935", emoji: "📜", familiarity: 'medium', category: 'politics' },
  { id: "king_abdication", event: "Edward VIII abdicates", year: 1936, fullDate: "December 11, 1936", emoji: "👑", familiarity: 'medium', category: 'politics', relatedGroup: 'royals' },
  { id: "war_worlds", event: "War of the Worlds broadcast", year: 1938, fullDate: "October 30, 1938", emoji: "👽", familiarity: 'high', category: 'culture' },

  // Puzzle 41: 1947-1953 Mix (6 year span)
  { id: "sound_barrier", event: "Sound barrier broken", year: 1947, fullDate: "October 14, 1947", emoji: "✈️", familiarity: 'medium', category: 'science' },
  { id: "berlin_airlift", event: "Berlin Airlift begins", year: 1948, fullDate: "June 24, 1948", emoji: "✈️", familiarity: 'high', category: 'politics' },
  { id: "nhs", event: "NHS founded", year: 1948, fullDate: "July 5, 1948", emoji: "🏥", familiarity: 'high', category: 'politics' },
  { id: "george_vi", event: "King George VI dies", year: 1952, fullDate: "February 6, 1952", emoji: "👑", familiarity: 'medium', category: 'politics', relatedGroup: 'royals' },
  { id: "polio", event: "Polio vaccine announced", year: 1953, fullDate: "March 26, 1953", emoji: "💉", familiarity: 'high', category: 'science' },
  { id: "stalin", event: "Stalin dies", year: 1953, fullDate: "March 5, 1953", emoji: "☭", familiarity: 'high', category: 'politics' },

  // Puzzle 42: 1959-1965 Mix (6 year span)
  { id: "hawaii", event: "Hawaii becomes 50th state", year: 1959, fullDate: "August 21, 1959", emoji: "🌺", familiarity: 'medium', category: 'politics' },
  { id: "u2", event: "U-2 spy plane shot down", year: 1960, fullDate: "May 1, 1960", emoji: "✈️", familiarity: 'medium', category: 'conflict' },
  { id: "freedom_riders", event: "Freedom Riders begin", year: 1961, fullDate: "May 4, 1961", emoji: "🚌", familiarity: 'medium', category: 'politics' },
  { id: "bond_film", event: "First James Bond film released", year: 1962, fullDate: "October 5, 1962", emoji: "🎬", familiarity: 'high', category: 'culture' },
  { id: "birmingham", event: "Birmingham church bombing", year: 1963, fullDate: "September 15, 1963", emoji: "💔", familiarity: 'medium', category: 'conflict' },
  { id: "civil_rights", event: "Civil Rights Act signed", year: 1964, fullDate: "July 2, 1964", emoji: "✊", familiarity: 'high', category: 'politics' },

  // Puzzle 43: 1974-1980 Mix (6 year span)
  { id: "nixon_pardon", event: "Ford pardons Nixon", year: 1974, fullDate: "September 8, 1974", emoji: "📜", familiarity: 'medium', category: 'politics', relatedGroup: 'nixon' },
  { id: "vietnam_end", event: "Vietnam War ends", year: 1975, fullDate: "April 30, 1975", emoji: "🕊️", familiarity: 'high', category: 'conflict' },
  { id: "viking", event: "Viking 1 lands on Mars", year: 1976, fullDate: "July 20, 1976", emoji: "🚀", familiarity: 'medium', category: 'science' },
  { id: "sex_pistols", event: "Sex Pistols release Never Mind the Bollocks", year: 1977, fullDate: "October 28, 1977", emoji: "🎸", familiarity: 'medium', category: 'culture' },
  { id: "camp_david", event: "Camp David Accords signed", year: 1978, fullDate: "September 17, 1978", emoji: "🕊️", familiarity: 'medium', category: 'politics' },
  { id: "iran_hostage", event: "Iran hostage crisis begins", year: 1979, fullDate: "November 4, 1979", emoji: "🏢", familiarity: 'high', category: 'conflict' },

  // Puzzle 44: 1983-1989 Mix (6 year span)
  { id: "beirut_barracks", event: "Beirut barracks bombing", year: 1983, fullDate: "October 23, 1983", emoji: "💣", familiarity: 'medium', category: 'conflict' },
  { id: "ethiopian_famine", event: "Ethiopian famine peaks", year: 1984, fullDate: "October 23, 1984", emoji: "🌍", familiarity: 'high', category: 'conflict' },
  { id: "rainbow_warrior", event: "Rainbow Warrior sunk", year: 1985, fullDate: "July 10, 1985", emoji: "🌈", familiarity: 'medium', category: 'conflict' },
  { id: "space_shuttle", event: "Space Shuttle resumes flights", year: 1988, fullDate: "September 29, 1988", emoji: "🚀", familiarity: 'low', category: 'science', relatedGroup: 'space_shuttle' },
  { id: "rushdie", event: "Fatwa against Rushdie", year: 1989, fullDate: "February 14, 1989", emoji: "📖", familiarity: 'medium', category: 'culture' },
  { id: "romania", event: "Romanian Revolution", year: 1989, fullDate: "December 22, 1989", emoji: "🇷🇴", familiarity: 'medium', category: 'politics' },

  // Puzzle 45: 1991-1996 Mix (5 year span) - Events from Puzzle 10 relocated here
  { id: "rodney_king", event: "Rodney King beating", year: 1991, fullDate: "March 3, 1991", emoji: "📹", familiarity: 'high', category: 'conflict' },
  { id: "apartheid", event: "South Africa ends apartheid", year: 1991, fullDate: "June 17, 1991", emoji: "🇿🇦", familiarity: 'high', category: 'politics' },
  { id: "la_riots", event: "LA Riots", year: 1992, fullDate: "April 29, 1992", emoji: "🔥", familiarity: 'high', category: 'conflict' },
  { id: "eu", event: "European Union formed", year: 1993, fullDate: "November 1, 1993", emoji: "🇪🇺", familiarity: 'high', category: 'politics' },
  { id: "blackhawk", event: "Black Hawk Down incident", year: 1993, fullDate: "October 3, 1993", emoji: "🚁", familiarity: 'high', category: 'conflict' },
  { id: "tupac", event: "Tupac Shakur shot", year: 1996, fullDate: "September 7, 1996", emoji: "🎤", familiarity: 'high', category: 'culture' },

  // Puzzle 46: 1997-2002 Mix (5 year span)
  { id: "kyoto", event: "Kyoto Protocol adopted", year: 1997, fullDate: "December 11, 1997", emoji: "🌍", familiarity: 'medium', category: 'politics' },
  { id: "lewinsky", event: "Lewinsky scandal breaks", year: 1998, fullDate: "January 21, 1998", emoji: "📰", familiarity: 'high', category: 'politics', relatedGroup: 'clinton' },
  { id: "good_friday", event: "Good Friday Agreement", year: 1998, fullDate: "April 10, 1998", emoji: "🕊️", familiarity: 'high', category: 'politics' },
  { id: "indo_pak", event: "India-Pakistan nuclear tests", year: 1998, fullDate: "May 11, 1998", emoji: "☢️", familiarity: 'medium', category: 'conflict' },
  { id: "concorde_crash", event: "Concorde crash", year: 2000, fullDate: "July 25, 2000", emoji: "✈️", familiarity: 'high', category: 'conflict', relatedGroup: 'concorde' },
  { id: "bali", event: "Bali bombings", year: 2002, fullDate: "October 12, 2002", emoji: "💔", familiarity: 'medium', category: 'conflict' },

  // Puzzle 47: 2005-2010 Mix (5 year span)
  { id: "pope_jp2", event: "Pope John Paul II dies", year: 2005, fullDate: "April 2, 2005", emoji: "⛪", familiarity: 'high', category: 'culture' },
  { id: "benazir", event: "Benazir Bhutto assassinated", year: 2007, fullDate: "December 27, 2007", emoji: "🕯️", familiarity: 'medium', category: 'politics' },
  { id: "mumbai", event: "Mumbai terror attacks", year: 2008, fullDate: "November 26, 2008", emoji: "💔", familiarity: 'high', category: 'conflict' },
  { id: "swine_flu", event: "Swine flu pandemic", year: 2009, fullDate: "June 11, 2009", emoji: "🦠", familiarity: 'medium', category: 'science' },
  { id: "eyjafjallajokull", event: "Iceland volcano erupts", year: 2010, fullDate: "April 14, 2010", emoji: "🌋", familiarity: 'high', category: 'conflict' },
  { id: "wikileaks", event: "WikiLeaks releases cables", year: 2010, fullDate: "November 28, 2010", emoji: "📁", familiarity: 'high', category: 'politics' },

  // Puzzle 48: 2011-2016 Mix (5 year span)
  { id: "nz_earthquake", event: "Christchurch earthquake", year: 2011, fullDate: "February 22, 2011", emoji: "🏚️", familiarity: 'medium', category: 'conflict' },
  { id: "gaddafi", event: "Gaddafi killed", year: 2011, fullDate: "October 20, 2011", emoji: "⚔️", familiarity: 'high', category: 'conflict' },
  { id: "felix", event: "Felix Baumgartner space jump", year: 2012, fullDate: "October 14, 2012", emoji: "🪂", familiarity: 'high', category: 'science' },
  { id: "crimea", event: "Russia annexes Crimea", year: 2014, fullDate: "March 18, 2014", emoji: "🇷🇺", familiarity: 'high', category: 'conflict' },
  { id: "charlie_hebdo", event: "Charlie Hebdo attack", year: 2015, fullDate: "January 7, 2015", emoji: "💔", familiarity: 'high', category: 'conflict' },
  { id: "pulse", event: "Pulse nightclub shooting", year: 2016, fullDate: "June 12, 2016", emoji: "🏳️‍🌈", familiarity: 'high', category: 'conflict' },

  // Puzzle 49: 2016-2021 Mix (5 year span)
  { id: "cubs", event: "Cubs win World Series", year: 2016, fullDate: "November 2, 2016", emoji: "⚾", familiarity: 'medium', category: 'sports' },
  { id: "charlottesville", event: "Charlottesville rally", year: 2017, fullDate: "August 12, 2017", emoji: "😢", familiarity: 'high', category: 'conflict' },
  { id: "hurricane_maria", event: "Hurricane Maria hits Puerto Rico", year: 2017, fullDate: "September 20, 2017", emoji: "🌀", familiarity: 'high', category: 'conflict' },
  { id: "parkland", event: "Parkland school shooting", year: 2018, fullDate: "February 14, 2018", emoji: "💔", familiarity: 'high', category: 'conflict' },
  { id: "amazon_fire", event: "Amazon rainforest fires", year: 2019, fullDate: "August 15, 2019", emoji: "🔥", familiarity: 'high', category: 'conflict' },
  { id: "myanmar", event: "Myanmar military coup", year: 2021, fullDate: "February 1, 2021", emoji: "🇲🇲", familiarity: 'medium', category: 'politics' },

  // Puzzle 50: 1925-1932 Mix (7 year span)
  { id: "great_gatsby", event: "Great Gatsby published", year: 1925, fullDate: "April 10, 1925", emoji: "📚", familiarity: 'high', category: 'culture' },
  { id: "penicillin", event: "Penicillin discovered", year: 1928, fullDate: "September 28, 1928", emoji: "💊", familiarity: 'high', category: 'science' },
  { id: "st_valentines", event: "St. Valentine's Day Massacre", year: 1929, fullDate: "February 14, 1929", emoji: "🔫", familiarity: 'medium', category: 'conflict' },
  { id: "pluto_discovered", event: "Pluto discovered", year: 1930, fullDate: "February 18, 1930", emoji: "🪐", familiarity: 'medium', category: 'science' },
  { id: "star_spangled", event: "Star-Spangled Banner becomes anthem", year: 1931, fullDate: "March 3, 1931", emoji: "🇺🇸", familiarity: 'low', category: 'politics' },
  { id: "lindbergh_baby", event: "Lindbergh baby kidnapped", year: 1932, fullDate: "March 1, 1932", emoji: "👶", familiarity: 'medium', category: 'conflict' },

  // Puzzle 51: 1939-1945 Mix (6 year span - WWII Focus)
  { id: "gone_wind", event: "Gone with the Wind released", year: 1939, fullDate: "December 15, 1939", emoji: "🎬", familiarity: 'high', category: 'culture' },
  { id: "blitz", event: "London Blitz begins", year: 1940, fullDate: "September 7, 1940", emoji: "💣", familiarity: 'high', category: 'conflict' },
  { id: "barbarossa", event: "Operation Barbarossa begins", year: 1941, fullDate: "June 22, 1941", emoji: "⚔️", familiarity: 'medium', category: 'conflict' },
  { id: "stalingrad", event: "Battle of Stalingrad begins", year: 1942, fullDate: "August 23, 1942", emoji: "⚔️", familiarity: 'high', category: 'conflict' },
  { id: "italy_surrender", event: "Italy surrenders", year: 1943, fullDate: "September 8, 1943", emoji: "🇮🇹", familiarity: 'medium', category: 'conflict' },
  { id: "vj_day", event: "VJ Day - Victory over Japan", year: 1945, fullDate: "August 15, 1945", emoji: "🎉", familiarity: 'high', category: 'conflict' },

  // Puzzle 52: 1954-1959 Mix (5 year span)
  { id: "mccarthy", event: "McCarthy hearings end", year: 1954, fullDate: "December 2, 1954", emoji: "⚖️", familiarity: 'medium', category: 'politics' },
  { id: "james_dean", event: "James Dean dies", year: 1955, fullDate: "September 30, 1955", emoji: "🎬", familiarity: 'high', category: 'culture' },
  { id: "hungarian", event: "Hungarian Revolution", year: 1956, fullDate: "October 23, 1956", emoji: "🇭🇺", familiarity: 'medium', category: 'conflict' },
  { id: "little_rock", event: "Little Rock Nine", year: 1957, fullDate: "September 4, 1957", emoji: "✊", familiarity: 'high', category: 'politics' },
  { id: "buddy_holly", event: "Buddy Holly dies", year: 1959, fullDate: "February 3, 1959", emoji: "🎸", familiarity: 'high', category: 'culture' },
  { id: "dalai_lama", event: "Dalai Lama flees Tibet", year: 1959, fullDate: "March 17, 1959", emoji: "🙏", familiarity: 'medium', category: 'politics' },

  // Puzzle 53: 1966-1972 Mix (6 year span) - cultural_rev moved to Puzzle 4
  { id: "che", event: "Che Guevara killed", year: 1967, fullDate: "October 9, 1967", emoji: "✊", familiarity: 'high', category: 'conflict' },
  { id: "tet", event: "Tet Offensive", year: 1968, fullDate: "January 30, 1968", emoji: "⚔️", familiarity: 'medium', category: 'conflict' },
  { id: "stonewall", event: "Stonewall riots", year: 1969, fullDate: "June 28, 1969", emoji: "🏳️‍🌈", familiarity: 'high', category: 'politics' },
  { id: "earth_day", event: "First Earth Day", year: 1970, fullDate: "April 22, 1970", emoji: "🌍", familiarity: 'medium', category: 'culture' },
  { id: "bloody_sunday", event: "Bloody Sunday", year: 1972, fullDate: "January 30, 1972", emoji: "💔", familiarity: 'medium', category: 'conflict' },
  { id: "pong", event: "Pong released", year: 1972, fullDate: "November 29, 1972", emoji: "🎮", familiarity: 'high', category: 'culture' },

  // Puzzle 54: 1978-1984 Mix (6 year span)
  { id: "jonestown", event: "Jonestown massacre", year: 1978, fullDate: "November 18, 1978", emoji: "💔", familiarity: 'high', category: 'conflict' },
  { id: "three_mile", event: "Three Mile Island accident", year: 1979, fullDate: "March 28, 1979", emoji: "☢️", familiarity: 'high', category: 'conflict' },
  { id: "moscow_olympics", event: "US boycotts Moscow Olympics", year: 1980, fullDate: "July 19, 1980", emoji: "🏅", familiarity: 'medium', category: 'sports' },
  { id: "solidarity", event: "Solidarity movement begins", year: 1980, fullDate: "August 14, 1980", emoji: "✊", familiarity: 'medium', category: 'politics' },
  { id: "falklands_end", event: "Falklands War ends", year: 1982, fullDate: "June 14, 1982", emoji: "🇬🇧", familiarity: 'medium', category: 'conflict' },
  { id: "la_olympics", event: "LA Olympics", year: 1984, fullDate: "July 28, 1984", emoji: "🏅", familiarity: 'high', category: 'sports' },

  // Puzzle 55: 1985-1990 Mix (5 year span) - Events from Puzzle 10 relocated here
  { id: "titanic_found", event: "Titanic wreck discovered", year: 1985, fullDate: "September 1, 1985", emoji: "🚢", familiarity: 'high', category: 'science', relatedGroup: 'titanic' },
  { id: "kings_cross", event: "King's Cross fire", year: 1987, fullDate: "November 18, 1987", emoji: "🔥", familiarity: 'medium', category: 'conflict' },
  { id: "iran_air", event: "USS Vincennes shoots down airliner", year: 1988, fullDate: "July 3, 1988", emoji: "✈️", familiarity: 'low', category: 'conflict' },
  { id: "hillsborough", event: "Hillsborough disaster", year: 1989, fullDate: "April 15, 1989", emoji: "⚽", familiarity: 'high', category: 'conflict' },
  { id: "exxon", event: "Exxon Valdez oil spill", year: 1989, fullDate: "March 24, 1989", emoji: "🛢️", familiarity: 'high', category: 'conflict' },
  { id: "hubble", event: "Hubble Telescope launched", year: 1990, fullDate: "April 24, 1990", emoji: "🔭", familiarity: 'high', category: 'science' },

  // Puzzle 56: 1992-1997 Mix (5 year span)
  { id: "clinton_elected", event: "Clinton elected President", year: 1992, fullDate: "November 3, 1992", emoji: "🇺🇸", familiarity: 'high', category: 'politics', relatedGroup: 'clinton' },
  { id: "world_trade_93", event: "World Trade Center bombing", year: 1993, fullDate: "February 26, 1993", emoji: "💣", familiarity: 'medium', category: 'conflict' },
  { id: "srebrenica", event: "Srebrenica massacre", year: 1995, fullDate: "July 11, 1995", emoji: "💔", familiarity: 'medium', category: 'conflict' },
  { id: "rabin", event: "Rabin assassinated", year: 1995, fullDate: "November 4, 1995", emoji: "🕯️", familiarity: 'medium', category: 'politics' },
  { id: "dunblane", event: "Dunblane massacre", year: 1996, fullDate: "March 13, 1996", emoji: "💔", familiarity: 'high', category: 'conflict' },
  { id: "diana_landmines", event: "Diana walks through minefield", year: 1997, fullDate: "January 15, 1997", emoji: "🌹", familiarity: 'high', category: 'culture', relatedGroup: 'diana' },

  // Puzzle 57: 1999-2004 Mix (5 year span)
  { id: "euro_launch", event: "Euro currency launches", year: 1999, fullDate: "January 1, 1999", emoji: "💶", familiarity: 'medium', category: 'economics', relatedGroup: 'euro' },
  { id: "wto", event: "WTO protests in Seattle", year: 1999, fullDate: "November 30, 1999", emoji: "✊", familiarity: 'low', category: 'politics' },
  { id: "iss", event: "First ISS crew arrives", year: 2000, fullDate: "November 2, 2000", emoji: "🛰️", familiarity: 'medium', category: 'science' },
  { id: "foot_mouth", event: "UK foot-and-mouth outbreak", year: 2001, fullDate: "February 19, 2001", emoji: "🐄", familiarity: 'medium', category: 'conflict' },
  { id: "madrid", event: "Madrid train bombings", year: 2004, fullDate: "March 11, 2004", emoji: "💔", familiarity: 'high', category: 'conflict' },
  { id: "expansion_eu", event: "EU expands to 25 countries", year: 2004, fullDate: "May 1, 2004", emoji: "🇪🇺", familiarity: 'low', category: 'politics' },

  // Puzzle 58: 2006-2011 Mix (5 year span)
  { id: "saddam", event: "Saddam Hussein executed", year: 2006, fullDate: "December 30, 2006", emoji: "⚖️", familiarity: 'high', category: 'politics' },
  { id: "financial_crash", event: "Global financial crisis", year: 2008, fullDate: "September 15, 2008", emoji: "📉", familiarity: 'high', category: 'economics' },
  { id: "obama_inaug", event: "Obama inaugurated", year: 2009, fullDate: "January 20, 2009", emoji: "🇺🇸", familiarity: 'high', category: 'politics' },
  { id: "h1n1", event: "H1N1 pandemic declared", year: 2009, fullDate: "June 11, 2009", emoji: "🦠", familiarity: 'medium', category: 'science' },
  { id: "wikileaks_afghan", event: "WikiLeaks Afghan War logs", year: 2010, fullDate: "July 25, 2010", emoji: "📁", familiarity: 'medium', category: 'politics' },
  { id: "libya_war", event: "NATO intervention in Libya", year: 2011, fullDate: "March 19, 2011", emoji: "⚔️", familiarity: 'medium', category: 'conflict' },

  // Puzzle 59: 2012-2017 Mix (5 year span)
  { id: "mars_curiosity", event: "Curiosity lands on Mars", year: 2012, fullDate: "August 6, 2012", emoji: "🚀", familiarity: 'medium', category: 'science' },
  { id: "pope_resigns", event: "Pope Benedict XVI resigns", year: 2013, fullDate: "February 28, 2013", emoji: "⛪", familiarity: 'high', category: 'culture' },
  { id: "isis", event: "ISIS declares caliphate", year: 2014, fullDate: "June 29, 2014", emoji: "⚔️", familiarity: 'high', category: 'conflict' },
  { id: "germanwings", event: "Germanwings crash", year: 2015, fullDate: "March 24, 2015", emoji: "✈️", familiarity: 'medium', category: 'conflict' },
  { id: "brussels", event: "Brussels airport bombing", year: 2016, fullDate: "March 22, 2016", emoji: "💔", familiarity: 'medium', category: 'conflict' },
  { id: "manchester", event: "Manchester Arena bombing", year: 2017, fullDate: "May 22, 2017", emoji: "💔", familiarity: 'high', category: 'conflict' },

  // Puzzle 60: 2018-2023 Mix (5 year span)
  { id: "musk_weed", event: "Elon Musk smokes weed on podcast", year: 2018, fullDate: "September 6, 2018", emoji: "🌿", familiarity: 'high', category: 'culture' },
  { id: "christchurch", event: "Christchurch mosque shooting", year: 2019, fullDate: "March 15, 2019", emoji: "💔", familiarity: 'high', category: 'conflict' },
  { id: "australian_fires", event: "Australian bushfires", year: 2020, fullDate: "January 2, 2020", emoji: "🔥", familiarity: 'high', category: 'conflict' },
  { id: "biden", event: "Biden elected President", year: 2020, fullDate: "November 7, 2020", emoji: "🇺🇸", familiarity: 'high', category: 'politics' },
  { id: "afghanistan", event: "US withdraws from Afghanistan", year: 2021, fullDate: "August 30, 2021", emoji: "🇦🇫", familiarity: 'high', category: 'conflict' },
  { id: "twitter_musk", event: "Musk buys Twitter", year: 2022, fullDate: "October 27, 2022", emoji: "🐦", familiarity: 'high', category: 'economics' },

  // Puzzle 61: 1945-1950 Mix (5 year span)
  { id: "yalta", event: "Yalta Conference", year: 1945, fullDate: "February 4, 1945", emoji: "🤝", familiarity: 'medium', category: 'politics' },
  { id: "imf", event: "IMF and World Bank founded", year: 1945, fullDate: "December 27, 1945", emoji: "🏦", familiarity: 'medium', category: 'economics' },
  { id: "churchill_speech", event: "Iron Curtain speech", year: 1946, fullDate: "March 5, 1946", emoji: "🎤", familiarity: 'high', category: 'politics' },
  { id: "marshall_plan", event: "Marshall Plan announced", year: 1947, fullDate: "June 5, 1947", emoji: "💰", familiarity: 'medium', category: 'economics' },
  { id: "nba", event: "NBA founded", year: 1949, fullDate: "August 3, 1949", emoji: "🏀", familiarity: 'medium', category: 'sports' },
  { id: "credit_card", event: "First credit card issued", year: 1950, fullDate: "February 8, 1950", emoji: "💳", familiarity: 'medium', category: 'economics' },

  // Puzzle 62: 1960-1965 Mix (5 year span)
  { id: "pill", event: "Birth control pill approved", year: 1960, fullDate: "May 9, 1960", emoji: "💊", familiarity: 'high', category: 'science' },
  { id: "eichmann", event: "Eichmann trial begins", year: 1961, fullDate: "April 11, 1961", emoji: "⚖️", familiarity: 'medium', category: 'politics' },
  { id: "beatles_debut", event: "Beatles release first single", year: 1962, fullDate: "October 5, 1962", emoji: "🎵", familiarity: 'high', category: 'culture', relatedGroup: 'beatles' },
  { id: "nuclear_test_ban", event: "Nuclear Test Ban Treaty", year: 1963, fullDate: "August 5, 1963", emoji: "☮️", familiarity: 'medium', category: 'politics' },
  { id: "warren_commission", event: "Warren Commission report", year: 1964, fullDate: "September 24, 1964", emoji: "📋", familiarity: 'medium', category: 'politics', relatedGroup: 'kennedy' },
  { id: "watts", event: "Watts riots", year: 1965, fullDate: "August 11, 1965", emoji: "🔥", familiarity: 'medium', category: 'conflict' },

  // Puzzle 63: 1970-1976 Mix (6 year span)
  { id: "beatles_split", event: "Beatles break up", year: 1970, fullDate: "April 10, 1970", emoji: "🎸", familiarity: 'high', category: 'culture', relatedGroup: 'beatles' },
  { id: "bangladesh", event: "Bangladesh War of Independence", year: 1971, fullDate: "March 26, 1971", emoji: "🇧🇩", familiarity: 'low', category: 'conflict' },
  { id: "attica", event: "Attica prison riot", year: 1971, fullDate: "September 9, 1971", emoji: "🔒", familiarity: 'medium', category: 'conflict' },
  { id: "munich_olympics", event: "Munich Olympics massacre", year: 1972, fullDate: "September 5, 1972", emoji: "😢", familiarity: 'high', category: 'conflict' },
  { id: "pinochet", event: "Pinochet coup in Chile", year: 1973, fullDate: "September 11, 1973", emoji: "🇨🇱", familiarity: 'medium', category: 'politics' },
  { id: "soweto", event: "Soweto uprising", year: 1976, fullDate: "June 16, 1976", emoji: "✊", familiarity: 'medium', category: 'conflict' },

  // Puzzle 64: 1980-1985 Mix (5 year span) - band_aid moved to Puzzle 10
  { id: "miracle_ice", event: "Miracle on Ice", year: 1980, fullDate: "February 22, 1980", emoji: "🏒", familiarity: 'high', category: 'sports' },
  { id: "volcano_helen", event: "Mount St. Helens erupts", year: 1980, fullDate: "May 18, 1980", emoji: "🌋", familiarity: 'high', category: 'conflict' },
  { id: "hunger_strikes", event: "Bobby Sands dies", year: 1981, fullDate: "May 5, 1981", emoji: "🇮🇪", familiarity: 'medium', category: 'politics' },
  { id: "princess_grace", event: "Princess Grace dies", year: 1982, fullDate: "September 14, 1982", emoji: "👑", familiarity: 'medium', category: 'culture' },
  { id: "cd", event: "First commercial CD released", year: 1982, fullDate: "August 17, 1982", emoji: "💿", familiarity: 'medium', category: 'science' },
  { id: "german_reunify", event: "German reunification", year: 1990, fullDate: "October 3, 1990", emoji: "🇩🇪", familiarity: 'high', category: 'politics' },

  // Puzzle 65: 1986-1991 Mix (5 year span)
  { id: "space_station", event: "Mir space station launched", year: 1986, fullDate: "February 19, 1986", emoji: "🛰️", familiarity: 'medium', category: 'science' },
  { id: "reagan_gorbachev", event: "Reagan-Gorbachev summit", year: 1986, fullDate: "October 11, 1986", emoji: "🤝", familiarity: 'medium', category: 'politics' },
  { id: "intifada", event: "First Intifada begins", year: 1987, fullDate: "December 9, 1987", emoji: "✊", familiarity: 'medium', category: 'conflict' },
  { id: "piper_alpha", event: "Piper Alpha disaster", year: 1988, fullDate: "July 6, 1988", emoji: "🔥", familiarity: 'medium', category: 'conflict' },
  { id: "velvet", event: "Velvet Revolution", year: 1989, fullDate: "November 17, 1989", emoji: "🇨🇿", familiarity: 'medium', category: 'politics' },
  { id: "desert_storm", event: "Desert Storm begins", year: 1991, fullDate: "January 17, 1991", emoji: "⚔️", familiarity: 'high', category: 'conflict' },

  // Puzzle 66: 1991-1998 Mix (7 year span) - Events adjusted from original
  { id: "first_website", event: "First website goes public", year: 1991, fullDate: "August 6, 1991", emoji: "🌐", familiarity: 'high', category: 'science' },
  { id: "great_flood", event: "Great Midwest Flood", year: 1993, fullDate: "July 11, 1993", emoji: "🌊", familiarity: 'low', category: 'conflict' },
  { id: "waco_siege", event: "Waco siege begins", year: 1993, fullDate: "February 28, 1993", emoji: "🔥", familiarity: 'medium', category: 'conflict' },
  { id: "panama", event: "US invades Panama", year: 1989, fullDate: "December 20, 1989", emoji: "⚔️", familiarity: 'medium', category: 'conflict' },
  { id: "starr", event: "Starr Report released", year: 1998, fullDate: "September 11, 1998", emoji: "📋", familiarity: 'medium', category: 'politics', relatedGroup: 'clinton' },
  { id: "embassy_bomb", event: "US Embassy bombings", year: 1998, fullDate: "August 7, 1998", emoji: "💣", familiarity: 'medium', category: 'conflict' },

  // Puzzle 67: 2000-2005 Mix (5 year span)
  { id: "chad", event: "Florida recount controversy", year: 2000, fullDate: "November 8, 2000", emoji: "🗳️", familiarity: 'high', category: 'politics' },
  { id: "mir_end", event: "Mir space station deorbited", year: 2001, fullDate: "March 23, 2001", emoji: "🛰️", familiarity: 'low', category: 'science' },
  { id: "anthrax", event: "Anthrax letters sent", year: 2001, fullDate: "September 18, 2001", emoji: "☣️", familiarity: 'medium', category: 'conflict' },
  { id: "sars", event: "SARS outbreak", year: 2003, fullDate: "February 10, 2003", emoji: "🦠", familiarity: 'high', category: 'science' },
  { id: "sudan", event: "Darfur genocide declared", year: 2004, fullDate: "September 9, 2004", emoji: "💔", familiarity: 'medium', category: 'conflict' },
  { id: "pope_benedict", event: "Pope Benedict XVI elected", year: 2005, fullDate: "April 19, 2005", emoji: "⛪", familiarity: 'high', category: 'culture' },

  // Puzzle 68: 2007-2012 Mix (5 year span)
  { id: "kindle", event: "Amazon Kindle released", year: 2007, fullDate: "November 19, 2007", emoji: "📚", familiarity: 'medium', category: 'science' },
  { id: "kashmir", event: "Mumbai attacks", year: 2008, fullDate: "November 26, 2008", emoji: "💔", familiarity: 'high', category: 'conflict' },
  { id: "hudson", event: "Miracle on the Hudson", year: 2009, fullDate: "January 15, 2009", emoji: "✈️", familiarity: 'high', category: 'conflict' },
  { id: "chile_miners", event: "Chilean miners rescued", year: 2010, fullDate: "October 13, 2010", emoji: "⛏️", familiarity: 'high', category: 'conflict' },
  { id: "japan_tsunami", event: "Japan tsunami", year: 2011, fullDate: "March 11, 2011", emoji: "🌊", familiarity: 'high', category: 'conflict' },
  { id: "diamond_jubilee", event: "Queen's Diamond Jubilee", year: 2012, fullDate: "June 3, 2012", emoji: "👑", familiarity: 'high', category: 'culture', relatedGroup: 'royals' },

  // Puzzle 69: 2013-2018 Mix (5 year span)
  { id: "horsemeat", event: "Horsemeat scandal", year: 2013, fullDate: "January 15, 2013", emoji: "🐴", familiarity: 'medium', category: 'economics' },
  { id: "sochi", event: "Sochi Winter Olympics", year: 2014, fullDate: "February 7, 2014", emoji: "🏅", familiarity: 'high', category: 'sports' },
  { id: "ebola", event: "Ebola epidemic peaks", year: 2014, fullDate: "August 8, 2014", emoji: "🦠", familiarity: 'high', category: 'science' },
  { id: "grenfell", event: "Grenfell Tower fire", year: 2017, fullDate: "June 14, 2017", emoji: "🔥", familiarity: 'high', category: 'conflict' },
  { id: "bitcoin_peak", event: "Bitcoin reaches $20,000", year: 2017, fullDate: "December 17, 2017", emoji: "₿", familiarity: 'high', category: 'economics' },
  { id: "royal_wedding", event: "Harry and Meghan wed", year: 2018, fullDate: "May 19, 2018", emoji: "💒", familiarity: 'high', category: 'culture', relatedGroup: 'royals' },

  // Puzzle 70: 2019-2024 Mix (5 year span)
  { id: "impeach_trump", event: "Trump first impeachment", year: 2019, fullDate: "December 18, 2019", emoji: "⚖️", familiarity: 'high', category: 'politics', relatedGroup: 'trump' },
  { id: "megxit", event: "Meghan and Harry leave royals", year: 2020, fullDate: "January 8, 2020", emoji: "👑", familiarity: 'high', category: 'culture' },
  { id: "blm", event: "BLM protests worldwide", year: 2020, fullDate: "June 6, 2020", emoji: "✊", familiarity: 'high', category: 'politics' },
  { id: "scotus_barrett", event: "Amy Coney Barrett confirmed", year: 2020, fullDate: "October 26, 2020", emoji: "⚖️", familiarity: 'medium', category: 'politics' },
  { id: "charles_king", event: "Charles becomes King", year: 2022, fullDate: "September 8, 2022", emoji: "👑", familiarity: 'high', category: 'politics', relatedGroup: 'royals' },
  { id: "titan", event: "Titan submersible implodes", year: 2023, fullDate: "June 18, 2023", emoji: "🌊", familiarity: 'high', category: 'conflict' },
];

export const EVENTS_PER_PUZZLE = 6;
export const TOTAL_PUZZLES = Math.floor(EVENTS.length / EVENTS_PER_PUZZLE);
