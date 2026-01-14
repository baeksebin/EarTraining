import org.jetbrains.compose.desktop.application.dsl.TargetFormat
import org.jetbrains.kotlin.gradle.ExperimentalWasmDsl
import org.jetbrains.kotlin.gradle.dsl.JvmTarget

plugins {
    alias(libs.plugins.kotlinMultiplatform)
    alias(libs.plugins.androidApplication)
    alias(libs.plugins.composeMultiplatform)
    alias(libs.plugins.composeCompiler)
}

kotlin {
    androidTarget {
        compilerOptions {
            jvmTarget.set(JvmTarget.JVM_21)
        }
    }

    // 1. 타겟 선언을 위로 올립니다.
    @OptIn(ExperimentalWasmDsl::class)
    wasmJs {
        browser {
            commonWebpackConfig {
                outputFileName = "composeApp.js"
                // ✅ 복잡한 devServer 설정은 모두 지웁니다.
            }
        }
        binaries.executable()
    }

    listOf(
        iosArm64(),
        iosSimulatorArm64()
    ).forEach { iosTarget ->
        iosTarget.binaries.framework {
            baseName = "ComposeApp"
            isStatic = true
        }
    }
    
//    js {
//        browser()
//        binaries.executable()
//    }
    
//    @OptIn(ExperimentalWasmDsl::class)
//    wasmJs {
//        browser()
//        binaries.executable()
//    }

    sourceSets {

        val wasmJsMain by getting {
            // 기존 설정
            resources.srcDir("src/wasmJsMain/resources")

            // ✅ 여기에 이 한 줄을 추가하는 것입니다!
            // commonMain에 있는 html 파일을 wasmJs의 리소스로 직접 포함시킵니다.
            resources.srcDir("src/commonMain/composeResources/files")
        }

        // ✅ 안드로이드 소스셋에도 공통 리소스 경로를 연결합니다.
        val androidMain by getting {
            resources.srcDir("src/commonMain/composeResources/files") // index.html이 있는 곳

            dependencies {
                implementation(compose.preview)
                implementation(libs.androidx.activity.compose)
            }
        }

        androidMain.dependencies {
            implementation(compose.preview)
            implementation(libs.androidx.activity.compose)
        }
        commonMain.dependencies {
            implementation(compose.runtime)
            implementation(compose.foundation)
            implementation(compose.material3)
            implementation(compose.ui)
            implementation(compose.components.resources)
            implementation(compose.components.uiToolingPreview)
            implementation(libs.androidx.lifecycle.viewmodelCompose)
            implementation(libs.androidx.lifecycle.runtimeCompose)
            implementation(libs.compose.webview)
        }
        commonTest.dependencies {
            implementation(libs.kotlin.test)
        }
    }
}

android {
    namespace = "com.akbobada.eartraining.eartraining"
    compileSdk = libs.versions.android.compileSdk.get().toInt()

    // ✅ 이 sourceSets 블록을 추가해야 합니다!
    sourceSets {
        getByName("main") {
            // commonMain에 있는 html/js 폴더를 안드로이드의 assets로 등록
            assets.srcDirs("src/commonMain/composeResources/files")
        }
    }
    
    defaultConfig {
        applicationId = "com.akbobada.eartraining.eartraining"
        minSdk = libs.versions.android.minSdk.get().toInt()
        targetSdk = libs.versions.android.targetSdk.get().toInt()
        versionCode = 1
        versionName = "1.0"
    }
    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
    buildTypes {
        getByName("release") {
            isMinifyEnabled = false
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_21
        targetCompatibility = JavaVersion.VERSION_21
    }
}

dependencies {
    debugImplementation(compose.uiTooling)
}

tasks.withType<ProcessResources> {
    duplicatesStrategy = DuplicatesStrategy.EXCLUDE
}
