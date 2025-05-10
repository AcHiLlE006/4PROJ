val appModule = module {
    single<IncidentApiService> { createRetrofit().create(IncidentApiService::class.java) }
    single<IncidentRepository> { IncidentRepositoryImpl(get()) }
    factory { ReportIncidentUseCase(get()) }
}