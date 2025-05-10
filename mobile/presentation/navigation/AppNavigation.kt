@Composable
fun AppNavigation() {
    val navController = rememberNavController()
    NavHost(navController, startDestination = "home") {
        composable("home") { HomeScreen(navController) }
        composable("map") { MapScreen(navController) }
        composable("report") { ReportIncidentScreen(navController) }
        composable("settings") { SettingsScreen(navController) }
    }
}