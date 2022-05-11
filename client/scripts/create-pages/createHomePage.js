$(window).on('load', () => {
    createHome();
 });

const createHome = async () => {
    $("#logo-and-title").load("client/pages/default/page_segments/logo-title.html");

    if (!(await isUserLoggedIn())) {
        $("#navig-menu").load("client/pages/default/page_segments/navig-menu.html");
        $("#chat-messaging-form").load("client/pages/default/page_segments/chat-messaging-form.html");
        $("#login-register-modals").load("client/pages/default/page_segments/login-register-modals.html");
    }
    else {
        $("#navig-menu").load("client/pages/user/page_segments/navig-menu.html");
        $("#chat-messaging-form").load("client/pages/user/page_segments/chat-messaging-form.html");
    }
}
