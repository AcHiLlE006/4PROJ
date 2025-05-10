class SupmapApp : Application() {
    override fun onCreate() {
        super.onCreate()
        startKoin {
            androidContext(this@SupmapApp)
            modules(appModule)
        }
    }
}