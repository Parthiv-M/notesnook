import {
  StorageInterface,
  databaseTest,
  noteTest,
  notebookTest,
} from "./utils";
import v52Backup from "./__fixtures__/backup.v5.2.json";

beforeEach(() => {
  StorageInterface.clear();
});

test("export backup", () =>
  noteTest().then(() =>
    notebookTest().then(async ({ db }) => {
      const exp = await db.backup.export("node");
      let backup = JSON.parse(exp);
      expect(backup.type).toBe("node");
      expect(backup.date).toBeGreaterThan(0);
    })
  ));

test("export encrypted backup", () =>
  noteTest().then(() =>
    notebookTest().then(async ({ db }) => {
      const exp = await db.backup.export("node", true);
      let backup = JSON.parse(exp);
      expect(backup.type).toBe("node");
      expect(backup.date).toBeGreaterThan(0);
      expect(backup.data.iv).toBe("some iv");
    })
  ));

test("import backup", () =>
  noteTest().then(() =>
    notebookTest().then(async ({ db, id }) => {
      const exp = await db.backup.export("node");
      StorageInterface.clear();
      await db.backup.import(exp);
      expect(db.notebooks.notebook(id).data.id).toBe(id);
    })
  ));

test("import encrypted backup", () =>
  noteTest().then(() =>
    notebookTest().then(async ({ db, id }) => {
      const exp = await db.backup.export("node", true);
      StorageInterface.clear();
      await db.backup.import(exp);
      expect(db.notebooks.notebook(id).data.id).toBe(id);
    })
  ));

test("import tempered backup", () =>
  noteTest().then(() =>
    notebookTest().then(async ({ db, id }) => {
      const exp = await db.backup.export("node");
      StorageInterface.clear();
      const backup = JSON.parse(exp);
      backup.data.hello = "world";
      await expect(
        db.backup.import(JSON.stringify(backup))
      ).rejects.toThrowError(/tempered/);
    })
  ));

describe.each([["v5.2", v52Backup]])(
  "testing backup version: %s",
  (version, data) => {
    test(`import ${version} backup`, () => {
      return databaseTest().then(async (db) => {
        await db.backup.import(JSON.stringify(data));

        expect(db.settings.raw.id).toBeDefined();

        expect(
          db.notes.all.every((v) => {
            const doesNotHaveContent = v.contentId && !v.content;
            const doesNotHaveColors = !v.colors && (!v.color || v.color.length);
            const hasTopicsInAllNotebooks =
              !v.notebooks ||
              v.notebooks.every((nb) => !!nb.id && !!nb.topics && !nb.topic);
            return (
              doesNotHaveContent &&
              !v.notebook &&
              hasTopicsInAllNotebooks &&
              doesNotHaveColors
            );
          })
        ).toBeTruthy();

        expect(db.notebooks.all.every((v) => v.title != null)).toBeTruthy();

        const allContent = await db.content.all();
        expect(
          allContent.every((v) => v.type === "tiny" || v.deleted)
        ).toBeTruthy();
      });
    });

    test(`verify indices of ${version} backup`, () => {
      return databaseTest().then(async (db) => {
        await db.backup.import(JSON.stringify(data));

        verifyIndex(data, db, "notes", "notes");
        verifyIndex(data, db, "notebooks", "notebooks");
        verifyIndex(data, db, "content", "content");
        // verifyIndex(data, db, "trash", "trash");
      });
    });
  }
);

function verifyIndex(backup, db, backupCollection, collection) {
  if (!backup.data[backupCollection]) return;

  expect(
    backup.data[backupCollection].every(
      (v) => db[collection]._collection.indexer.indices.indexOf(v) > -1
    )
  ).toBeTruthy();
}
