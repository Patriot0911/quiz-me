import DataSource from '../data-source';
import { SeedAdmin1735000000001 } from './1735000000001-seed-admin';

async function runSeeds() {
  const dataSource = await DataSource.initialize();

  const seed = new SeedAdmin1735000000001();
  await seed.up(dataSource.createQueryRunner());

  await dataSource.destroy();
  console.log('Seeds executed successfully');
}

runSeeds().catch((err) => {
  console.error(err);
  process.exit(1);
});
