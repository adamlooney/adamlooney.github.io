// get the ninja-keys element
const ninja = document.querySelector('ninja-keys');

// add the home and posts menu items
ninja.data = [{
    id: "nav-about",
    title: "about",
    section: "Navigation",
    handler: () => {
      window.location.href = "/";
    },
  },{id: "nav-research",
          title: "research",
          description: "Publications in reversed chronological order.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/research/";
          },
        },{id: "nav-working-papers",
          title: "working papers",
          description: "Work in progress and unpublished papers.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/working-papers/";
          },
        },{id: "dropdown-government-service",
              title: "government service",
              description: "",
              section: "Dropdown",
              handler: () => {
                window.location.href = "/service/";
              },
            },{id: "dropdown-student-loans",
              title: "student loans",
              description: "",
              section: "Dropdown",
              handler: () => {
                window.location.href = "/student-loans/";
              },
            },{id: "dropdown-taxes",
              title: "taxes",
              description: "",
              section: "Dropdown",
              handler: () => {
                window.location.href = "/taxes/";
              },
            },{id: "dropdown-other-policy-writing",
              title: "other policy writing",
              description: "",
              section: "Dropdown",
              handler: () => {
                window.location.href = "/writing/";
              },
            },{id: "nav-other-projects",
          title: "other projects",
          description: "Calculators, visualizations, and assorted side projects.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/projects/";
          },
        },{id: "nav-cv",
          title: "cv",
          description: "Adam Looney&#39;s curriculum vitae.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/cv/";
          },
        },{id: "books-the-godfather",
          title: 'The Godfather',
          description: "",
          section: "Books",handler: () => {
              window.location.href = "/books/the_godfather/";
            },},{id: "projects-dimaggio-39-s-streak",
          title: 'DiMaggio&amp;#39;s Streak',
          description: "How improbable was the 56-game hitting streak? — placeholder, coming soon.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/1_dimaggios_streak/";
            },},{id: "projects-marathon-time-calculator",
          title: 'Marathon Time Calculator',
          description: "Predict your finish time and pacing — placeholder, coming soon.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/2_marathon_calculator/";
            },},{id: "projects-skiing-amp-outdoor-projects",
          title: 'Skiing &amp;amp; Outdoor Projects',
          description: "Lift wait times, singles lines, and other mountain data projects — placeholder, coming soon.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/3_ski_outdoor/";
            },},{id: "projects-mortgage-option-value-calculator",
          title: 'Mortgage Option-Value Calculator',
          description: "When is refinancing worth it? — placeholder, coming soon.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/4_mortgage_option_value/";
            },},{
      id: 'light-theme',
      title: 'Change theme to light',
      description: 'Change the theme of the site to Light',
      section: 'Theme',
      handler: () => {
        setThemeSetting("light");
      },
    },
    {
      id: 'dark-theme',
      title: 'Change theme to dark',
      description: 'Change the theme of the site to Dark',
      section: 'Theme',
      handler: () => {
        setThemeSetting("dark");
      },
    },
    {
      id: 'system-theme',
      title: 'Use system default theme',
      description: 'Change the theme of the site to System Default',
      section: 'Theme',
      handler: () => {
        setThemeSetting("system");
      },
    },];
