import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import IconButton from "../components/IconButton";
import Screen from "../components/Screen";
import { IconPlus, IconSettings } from "../components/icons";
import { paths } from "./paths";

export default function HomeScreen() {
  return (
    <Screen
      title="FollowCook"
      subtitle="Мои рецепты"
      headerRight={
        <IconButton
          to={paths.settings}
          label="Настройки"
          icon={<IconSettings />}
        />
      }
      footer={
        <Button to={paths.newRecipe} variant="primary" size="lg" block icon={<IconPlus />}>
          Новый рецепт
        </Button>
      }
    >
      <EmptyState
        title="Пока пусто"
        message="Добавьте первый рецепт — и он появится здесь."
      />
    </Screen>
  );
}
