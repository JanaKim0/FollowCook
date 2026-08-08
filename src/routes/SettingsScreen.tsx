import Card from "../components/Card";
import Screen from "../components/Screen";
import { paths } from "./paths";

export default function SettingsScreen() {
  return (
    <Screen title="Настройки" backTo={paths.home}>
      <Card>
        <p>Здесь будет выбор языка и информация об авторе.</p>
      </Card>
    </Screen>
  );
}
