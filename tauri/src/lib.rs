use std::io::Write;
use uuid::Uuid;

pub fn get_machine_id() -> std::io::Result<String> {
  let exe_path = std::env::current_exe()?;
  let app_path = exe_path.parent().unwrap().join("tmp");
  std::fs::create_dir_all(&app_path)?; // create tmp directory if it doesn't exist
  let file_path = app_path.join("device_id.txt");

  if file_path.exists() {
    let id = std::fs::read_to_string(&file_path)?;
    Ok(id)
  } else {
    let id = Uuid::new_v4().simple().to_string();
    std::fs::OpenOptions::new()
      .write(true)
      .create_new(true)
      .open(&file_path)?
      .write_all(id.as_bytes())?;
    Ok(id)
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use uuid::Uuid;

  #[tokio::test]
  async fn test_get_machine_id() {
    // The function uses the current executable's directory to locate the ID file
    // So no need to simulate the app directory in this case
    let id = get_machine_id().unwrap();
    assert!(
      Uuid::parse_str(&id).is_ok(),
      "Machine ID is not a valid UUID"
    );
  }

  #[tokio::test]
  async fn test_id_persistence() {
    // The function uses the current executable's directory to locate the ID file
    // So no need to simulate the app directory in this case
    let id1 = get_machine_id().unwrap();
    let id2 = get_machine_id().unwrap();
    assert_eq!(id1, id2, "Machine ID is not persistent");
  }
}
