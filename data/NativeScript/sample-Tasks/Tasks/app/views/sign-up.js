var signUpViewModelModule = require("../view-models/sign-up-view-model")

var viewModel;

function pageLoaded(args) {
    var page = args.object;
    viewModel = new signUpViewModelModule.SignUpViewModel();
    page.bindingContext = viewModel;
    
    viewModel.disableAutoCorrect(page, "email");
    viewModel.disableAutoCorrect(page, "username");
}

exports.pageLoaded = pageLoaded;

function signUpButtonTap(args) {
    viewModel.signUp();
}

exports.signUpButtonTap = signUpButtonTap;

function loginButtonTap(args) {
    viewModel.login();
}

exports.loginButtonTap = loginButtonTap;