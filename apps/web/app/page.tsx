import { NutritionForm } from "./nutrition-form";
import styles from "./page.module.css";
import "@community-nutrition/ui/styles"

export default function Home() {
  return (
    <div className={styles.page}>
      <main>
        <NutritionForm />
      </main>
      <footer className={styles.footer}>
      </footer>
    </div>
  );
}
