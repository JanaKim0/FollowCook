import Button from "../components/Button";
import Card from "../components/Card";
import Screen from "../components/Screen";
import { IconCheck } from "../components/icons";
import { paths } from "./paths";

export default function NewRecipeScreen() {
  return (
    <Screen
      title="Новый рецепт"
      backTo={paths.home}
      footer={
        <Button variant="primary" size="lg" block icon={<IconCheck />} disabled>
          Сохранить рецепт
        </Button>
      }
    >
      <Card>
        <p>Здесь будет форма: название, ингредиенты и этапы приготовления.</p>
      </Card>
    </Screen>
  );
}
