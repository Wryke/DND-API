function AccountPage(props) {
    return (
        <div>
            <h1>Account Settings</h1>

            <h2>Profile Information</h2>

            <p>
                <strong>Username:</strong> {props.currentUser.username}
            </p>

            <p>
                <strong>Email:</strong> {props.currentUser.email}
            </p>
        </div>
    )
}

export default AccountPage