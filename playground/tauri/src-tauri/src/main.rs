// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use nucleus_tauri::get_machine_id;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
  format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn get_device_id() -> tauri::Result<String> {
  get_machine_id()
    .map_err(|e| tauri::Error::from(e))
    .map(Ok)?
}

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![greet, get_device_id])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
