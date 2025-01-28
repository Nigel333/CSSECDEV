function insertNav() {
    document.write(`
    <nav>
    <a href="/">
        <img src="/static/images/logo/logo3.png" id="logo">
    </a>
    <div class="search-bar">
        <input type="text" placeholder="Search Weeb Lib..." id="search-text">
    </div>
    <div class="nav-buttons">
        <a href="/static/featured.html">Featured</a>
        <a href="/static/polls.html">Polls</a>
        <a href="/static/anime.html">Anime</a>
        <a href="/static/games.html">Games</a>
        <img src="/static/images/profile/cinnamoroll.png" id="profile">
        <div class="dropdown">
            <a href="javascript:void(0);" id="user-dropdown">
                <img src="/static/images/icons/dropdown.png" id="dropdown">
            </a>
            <div class="dropdown-content">
                <a href="/main-profile">My Profile</a>
                <a href="/signin">Log out</a>
            </div>
        </div>
        <a href="/signin" id="signin-link">Sign In</a>
    </div>
</nav>
    `);
}

function insertFooter() {
    document.write(`
    <footer>
    <br /><br />
    <div id="footer-logo">
        <img src="/static/images/logo/logo1.png" alt="Logo">
    </div>
    <br /><br />
    <div class="tabs">
        <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/static/main-profile.html">My Profile</a></li>
            <li><a href="/static/games.html">Games</a></li>
            <li><a href="/static/anime.html">Anime</a></li>
            <li><a href="/static/polls.html">Polls</a></li>
            <li><a href="/static/policy.html">Privacy Policy</a></li>
            <li><a href="/static/wip.html">About Us </a></li>
        </ul>
    </div>
    <br /><br />
    <div class="social-icons">
        <a href="#"><i class="fab fa-discord"></i></a>
        <a href="#"><i class="fab fa-facebook"></i></a>
        <a href="#"><i class="fab fa-twitter"></i></a>
        <a href="#"><i class="fab fa-instagram"></i></a>
        <a href="#"><i class="fab fa-twitch"></i></a>
    </div>
    <br /><br />
    <div class="copyright">
        <p>All rights reserved. &copy; 2023</p>
    </div>
    <br /><br /><br />
</footer>
    `);
}