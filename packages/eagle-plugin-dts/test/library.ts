/// <reference types="../eagle-plugin" />

async function exerciseLibraryAPI() {
  const queried = await eagle.item.get({
    isSelected: true,
    isUntagged: true,
    isUnfiled: true,
    keywords: ["cat"],
    tags: ["animal"],
    folders: ["folder-id"],
    ext: "png",
    annotation: "portrait",
    rating: 5,
    url: "https://example.com",
    shape: "square",
    fields: ["id", "name"],
  });
  await eagle.item.getAll();
  await eagle.item.getById("item-id");
  await eagle.item.getByIds(["item-id"]);
  await eagle.item.getSelected();
  await eagle.item.getIdsWithModifiedAt();
  await eagle.item.count({ rating: 3 });
  await eagle.item.countAll();
  await eagle.item.countSelected();
  await eagle.item.select(["item-id"]);
  await eagle.item.addFromURL("https://example.com/image.png", {
    name: "image",
  });
  await eagle.item.addFromBase64("data:image/png;base64,...", {});
  await eagle.item.addFromPath("/tmp/image.png", { tags: ["local"] });
  await eagle.item.addBookmark("https://example.com", { base64: "..." });
  await eagle.item.open("item-id", { window: true });

  const item = queried[0];
  if (item) {
    item.name = "New name";
    item.width = 100;
    item.height = 100;
    item.url = "https://example.com/new";
    item.annotation = "Updated";
    item.tags = ["updated"];
    item.folders = ["folder-id"];
    item.star = 4;
    item.importedAt = Date.now();
    await item.save();
    await item.moveToTrash();
    await item.replaceFile("/tmp/new.png");
    await item.refreshThumbnail();
    await item.setCustomThumbnail("/tmp/thumb.png");
    await item.open({ window: true });
    await item.select();
    await item.addComment({
      x: 10,
      y: 20,
      width: 30,
      height: 40,
      annotation: "Area",
    });
    await item.addComment({ duration: 12.5, annotation: "Scene" });
    await item.updateComment("comment-id", { duration: 13 });
    await item.removeComment("comment-id");
  }

  const folder = await eagle.folder.create({ name: "Folder" });
  await eagle.folder.createSubfolder(folder.id, { name: "Child" });
  await eagle.folder.get({ isSelected: true, isRecent: true });
  await eagle.folder.getAll();
  await eagle.folder.getById(folder.id);
  await eagle.folder.getByIds([folder.id]);
  await eagle.folder.getSelected();
  await eagle.folder.getRecents();
  await eagle.folder.open(folder.id);
  folder.iconColor = eagle.folder.IconColor.Blue;
  folder.parent = null;
  await folder.save();
  await folder.open();

  const smartFolderAPI = eagle.smartFolder;
  if (smartFolderAPI !== undefined) {
    const nameRule = smartFolderAPI.rule("name").contain("cat");
    const widthRule = smartFolderAPI.rule("width")[">"]([1920]);
    const directRule = new smartFolderAPI.Rule("type", "equal", "png");
    const condition = smartFolderAPI.Condition.create("AND", [
      nameRule,
      widthRule,
      directRule,
    ]);
    const smartFolder = await smartFolderAPI.create({
      name: "Large PNGs",
      conditions: [condition],
      iconColor: smartFolderAPI.IconColor.Blue,
    });
    await smartFolderAPI.create({
      name: "Raw condition",
      conditions: [
        {
          match: "AND",
          rules: [{ property: "name", method: "contain", value: "cat" }],
        },
      ],
    });
    await smartFolderAPI.get({ id: smartFolder.id });
    await smartFolderAPI.getAll();
    await smartFolderAPI.getById(smartFolder.id);
    await smartFolderAPI.getByIds([smartFolder.id]);
    await smartFolderAPI.getRules();
    await smartFolder.getItems({ orderBy: "name", fields: ["id", "name"] });
    await smartFolder.save();
    await smartFolderAPI.remove(smartFolder.id);
  }

  const tags = await eagle.tag.get({ name: "design" });
  await eagle.tag.getRecentTags();
  await eagle.tag.getStarredTags();
  await eagle.tag.merge({ source: "UI Design", target: "UI" });
  const tag = tags[0];
  if (tag) {
    tag.name = "renamed";
    tag.color = "red";
    await tag.save();
  }

  const tagGroup = await eagle.tagGroup.create({
    name: "Design",
    color: "red",
    tags: ["UI"],
    description: "Design tags",
  });
  await eagle.tagGroup.get();
  tagGroup.tags = ["UI", "UX"];
  await tagGroup.save();
  await tagGroup.addTags({ tags: ["Branding"], removeFromSource: true });
  await tagGroup.removeTags({ tags: ["UI"] });
  await tagGroup.remove();

  const _libraryInfo: Record<string, unknown> = await eagle.library.info();
  const _libraryName: string = eagle.library.name;
  const _libraryPath: string = eagle.library.path;
  const _modificationTime: number = eagle.library.modificationTime;
}

void exerciseLibraryAPI;
