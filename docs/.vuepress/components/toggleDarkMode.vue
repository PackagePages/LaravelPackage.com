<template>
  <div class="dark-mode-widget">
    <input type="checkbox" id="theme-toggle" @click="toggleDarkTheme" />
    <label for="theme-toggle"><span></span></label>
  </div>
</template>

<script>
export default {
  mounted() {
    this.checkUserPreference();
  },
  methods: {
    toggleDarkTheme() {
      const body = document.body;
      const navbar = document.getElementsByClassName("navbar");
      const sidebar = document.body.getElementsByTagName("aside");
      const footer = document.getElementsByTagName("footer");
      const next = document.getElementsByClassName("next");
      const prev = document.getElementsByClassName("prev");

      body.classList.toggle("dark-mode");
      navbar[0].classList.toggle("dark-mode");
      sidebar[0].classList.toggle("dark-mode");
      footer[0].classList.toggle("dark-mode");
      next[0].classList.toggle("dark-mode");
      prev[0].classList.toggle("dark-mode");
      //If dark mode is selected
      if (body.classList.contains("dark-mode")) {
        //Save user preference in storage
        localStorage.setItem("dark-theme", "true");
        //If light mode is selected
      } else {
        body.classList.remove("dark-mode");
        navbar[0].classList.remove("dark-mode");
        sidebar[0].classList.remove("dark-mode");
        footer[0].classList.remove("dark-mode");
        next[0].classList.remove("dark-mode");
        prev[0].classList.remove("dark-mode");
        setTimeout(function () {
          localStorage.removeItem("dark-theme");
        }, 100);
      }
    },
    checkUserPreference() {
      const navbar = document.getElementsByClassName("navbar");
      const sidebar = document.body.getElementsByTagName("aside");
      const footer = document.getElementsByTagName("footer");
      const next = document.getElementsByClassName("next");
      const prev = document.getElementsByClassName("prev");
      //Check Storage on Page load. Keep user preference through sessions
      if (localStorage.getItem("dark-theme")) {
        document.body.classList.add("dark-mode");
        navbar[0].classList.add("dark-mode");
        sidebar[0].classList.add("dark-mode");
        footer[0].classList.add("dark-mode");
        next[0].classList.add("dark-mode");
        prev[0].classList.add("dark-mode");
        document.getElementById("theme-toggle").checked = true;
      }
    },
  },
};
</script>

<style>
.dark-mode-widget {
  display: table;
  margin: 1em auto;
}
body.dark-mode {
  background: #2b2b2b;
}
header.dark-mode,
header.dark-mode .links,
header.dark-mode .nav-dropdown {
  background: #262626;
  border-bottom: none;
  border: none;
}
header.dark-mode > a.home-link > span.site-name {
  color: #ff4d5e;
}
header.dark-mode {
  color: #ed263a;
}
header.dark-mode
  .nav-links
  > .nav-item
  > .dropdown-wrapper
  > .dropdown-title
  > .title {
  color: #ed263a;
}
aside.dark-mode {
  background: #2b2b2b;
  border-right: none !important;
}
aside.dark-mode h1,
aside.dark-mode h2,
aside.dark-mode h3,
aside.dark-mode a {
  color: #ebebeb;
}
aside.dark-mode a:hover {
  color: #ff6978;
}
aside.dark-mode a.active {
  color: #ff4d5e;
  border-left-color: #ff4d5e;
}
body.dark-mode p {
  color: #ebebeb;
}
body.dark-mode code {
  color: #ff0f27;
}
body.dark-mode h1,
body.dark-mode h2,
body.dark-mode h3 {
  color: #ed263a;
}
body.dark-mode .header-anchor {
  color: #ff6978;
}
body.dark-mode table > tbody, body.dark-mode table > thead {
  background: #ffffff;
}
body.dark-mode p > a {
  color: #f23548;
}
footer.dark-mode div.edit-link > a {
  color: #f23548;
}
footer.dark-mode div.last-updated > span.prefix {
  color: white;
}
footer.dark-mode div.last-updated > span.time {
  color: #f23548;
}
span.dark-mode > a {
  color: #f23548;
}
#theme-toggle {
  display: none;
}
#theme-toggle + label {
  font-size: 1rem;
  display: flex;
  width: 4em;
  border-radius: 2em;
  background-size: auto 8em;
  background-position: bottom;
  background-image: linear-gradient(
    180deg,
    #021037 0%,
    #20206a 19%,
    #4184b1 66%,
    #62e7f7 100%
  );
  transition: 0.2s;
  border: 0.125em solid #eef3f6;
  overflow: hidden;
}
#theme-toggle + label span {
  background: #fffad8;
  border-radius: 50%;
  height: 2em;
  width: 2em;
  transform: translateX(-0.125em) scale(0.65);
  transition: 0.2s;
  cursor: pointer;
  box-shadow: 0 0 0.25em 0.0625em #fbee8d, 0 0 2em 0 #ffeb3b,
    inset -0.25em -0.25em 0 0 #fbee8e,
    inset -0.3125em -0.3125em 0 0.625em #fff5b2;
  margin-top: -0.125em;
}
#theme-toggle:checked {
  font-size: 10rem;
}
#theme-toggle:checked + label {
  background-position: top;
  border-color: #5983a6;
}
#theme-toggle:checked + label span {
  background: transparent;
  transform: translateX(calc(100%)) scale(0.65);
  box-shadow: inset -0.1875em -0.1875em 0 0 #fbe7ef,
    inset -0.5625em -0.5625em 0 0 #fffff7;
}
</style>
