@Composable
fun HomeScreen(navController: NavController) {
    Column(modifier = Modifier.fillMaxSize(), horizontalAlignment = Alignment.CenterHorizontally) {
        Text("Bienvenue sur SUPMAP")
        Button(onClick = { navController.navigate("map") }) { Text("Voir la carte") }
        Button(onClick = { navController.navigate("report") }) { Text("Signaler un incident") }
        Button(onClick = { navController.navigate("settings") }) { Text("Paramètres") }
    }
}