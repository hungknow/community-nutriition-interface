import { NutritionForm } from "./nutrition-form";
import styles from "./page.module.css";
import "@community-nutrition/ui/dist/styles/globals.css"

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <NutritionForm />
      </main>
      <footer className={styles.footer}>
      </footer>
    </div>
  );
}
