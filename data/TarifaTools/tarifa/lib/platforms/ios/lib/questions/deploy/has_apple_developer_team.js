module.exports = {
    dependency: 'ios',
    condition: function (answer) {
        return answer.deploy;
    },
    type:'confirm',
    name:'has_apple_developer_team',
    message:'Do you have multiple teams on your apple developer account?'
};
