plugins {
  id("com.android.application")
}

android {
  namespace = "com.settlemate.app"
  compileSdk = 35

  defaultConfig {
    applicationId = "com.settlemate.app"
    minSdk = 26
    targetSdk = 35
    versionCode = 1
    versionName = "0.1.0"
  }
}

dependencies {
  implementation("androidx.activity:activity-ktx:1.10.1")
  implementation("androidx.webkit:webkit:1.12.1")
}
