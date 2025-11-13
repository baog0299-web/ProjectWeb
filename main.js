fetch("assets/component/header-footer/header.html")
  .then(res => res.text())
  .then(data => {
    document.getElementById("header").innerHTML = data;

    // Load CSS header vào <head>
    const headerLinks = document.getElementById("header").querySelectorAll("link[rel='stylesheet']");
    headerLinks.forEach(link => {
      const newLink = document.createElement("link");
      newLink.rel = "stylesheet";
      newLink.href = "assets/component/header-footer/header.css"; // đường dẫn từ index.html
      document.head.appendChild(newLink);
    });
  });
fetch("assets/component/header-footer/footer.html")
  .then(res => res.text())
  .then(data => {
    document.getElementById("footer").innerHTML = data;

    // Load CSS header vào <footer>
    const headerLinks = document.getElementById("footer").querySelectorAll("link[rel='stylesheet']");
    headerLinks.forEach(link => {
      const newLink = document.createElement("link");
      newLink.rel = "stylesheet";
      newLink.href = "assets/component/header-footer/footer.css"; // đường dẫn từ index.html
      document.head.appendChild(newLink);
    });
  });