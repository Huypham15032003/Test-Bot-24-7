import { db } from "./db";
import { documents, userProfiles, badges, shopItems, forumThreads, forumReplies } from "@shared/schema";
import { users } from "@shared/models/auth";
import { count, or, eq } from "drizzle-orm";

export async function seedDatabase() {
  const systemUserId = "system-seed-user";

  await db.insert(users).values({
    id: systemUserId,
    email: "admin@humg.edu.vn",
    firstName: "HUMG",
    lastName: "Admin",
  }).onConflictDoNothing();

  await db.insert(userProfiles).values({
    userId: systemUserId,
    displayName: "HUMG Admin",
    faculty: "Khoa Dia chat",
    role: "admin",
    points: 500,
    bio: "Quan tri vien he thong HUMG Share",
    verified: true,
  }).onConflictDoNothing();

  const [docCount] = await db.select({ count: count() }).from(documents);
  if (Number(docCount?.count) === 0) {
    const seedDocs = [
      {
        title: "Slide bai giang Dia chat dai cuong - Chuong 1 den 5",
        description: "Tong hop slide bai giang mon Dia chat dai cuong, bao gom cac chuong tu 1 den 5. Noi dung: Khoang vat, da, cau truc Trai Dat, dia chat cau tao.",
        faculty: "Khoa Dia chat",
        subject: "Dia chat dai cuong",
        category: "Slide bai giang",
        tags: ["Dia chat dai cuong", "Khoang vat hoc", "Thach hoc"],
        uploaderId: systemUserId,
        status: "approved" as const,
        downloadCount: 156,
        viewCount: 520,
        averageRating: 45,
        ratingCount: 23,
        year: "2024-2025",
        fileName: "DCDC_Chuong1-5.pdf",
        fileSize: 15728640,
        fileType: "application/pdf",
      },
      {
        title: "De thi cuoi ky Khai thac lo thien 2023-2024",
        description: "Bo de thi cuoi ky mon Khai thac lo thien, kem dap an tham khao. Bao gom 3 de chinh thuc va 2 de du phong.",
        faculty: "Khoa Mo",
        subject: "Khai thac lo thien",
        category: "De thi cu",
        tags: ["Khai thac lo thien", "An toan mo"],
        uploaderId: systemUserId,
        status: "approved" as const,
        downloadCount: 234,
        viewCount: 890,
        averageRating: 48,
        ratingCount: 35,
        year: "2023-2024",
        fileName: "De_thi_KTLT_2023-2024.pdf",
        fileSize: 5242880,
        fileType: "application/pdf",
      },
      {
        title: "Huong dan su dung phan mem Surpac co ban",
        description: "Tai lieu huong dan su dung phan mem Surpac tu co ban den nang cao, bao gom mo hinh hoa dia chat, thiet ke mo lo thien.",
        faculty: "Khoa Mo",
        subject: "Tin hoc mo",
        category: "Phan mem chuyen nganh",
        tags: ["Surpac", "Khai thac lo thien", "GIS mo"],
        uploaderId: systemUserId,
        status: "approved" as const,
        downloadCount: 189,
        viewCount: 650,
        averageRating: 42,
        ratingCount: 18,
        year: "2024-2025",
        fileName: "Huong_dan_Surpac.pdf",
        fileSize: 25165824,
        fileType: "application/pdf",
      },
      {
        title: "Do an tot nghiep - Thiet ke khai thac mo da voi",
        description: "Do an tot nghiep chuyen nganh Khai thac mo. Noi dung: Thiet ke khai thac mo da voi cong suat 500.000 tan/nam tai tinh Ninh Binh.",
        faculty: "Khoa Mo",
        subject: "Do an tot nghiep",
        category: "Do an tot nghiep",
        tags: ["Khai thac lo thien", "An toan mo"],
        uploaderId: systemUserId,
        status: "approved" as const,
        downloadCount: 98,
        viewCount: 340,
        averageRating: 40,
        ratingCount: 12,
        year: "2023-2024",
        fileName: "DATN_Khai_thac_mo_da_voi.docx",
        fileSize: 10485760,
        fileType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      },
      {
        title: "Bai giang Co hoc dat da - GS. Nguyen Van A",
        description: "Tron bo bai giang mon Co hoc dat da cua GS. Nguyen Van A, bao gom ly thuyet va bai tap. Tai lieu tham khao tot cho ky thi.",
        faculty: "Khoa Dia chat",
        subject: "Co hoc dat da",
        category: "Slide bai giang",
        tags: ["Co hoc dat da", "Dia chat cong trinh"],
        uploaderId: systemUserId,
        status: "approved" as const,
        downloadCount: 145,
        viewCount: 480,
        averageRating: 46,
        ratingCount: 28,
        year: "2024-2025",
        fileName: "CHDD_Bai_giang.pptx",
        fileSize: 20971520,
        fileType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      },
      {
        title: "Tai lieu huong dan ArcGIS cho sinh vien Trac dia",
        description: "Huong dan su dung ArcGIS Desktop va ArcGIS Pro trong cong tac trac dia ban do. Bao gom cac bai tap thuc hanh chi tiet.",
        faculty: "Khoa Trac dia - Ban do",
        subject: "He thong thong tin dia ly",
        category: "Phan mem chuyen nganh",
        tags: ["ArcGIS", "GIS mo", "Trac dia mo"],
        uploaderId: systemUserId,
        status: "approved" as const,
        downloadCount: 167,
        viewCount: 560,
        averageRating: 44,
        ratingCount: 21,
        year: "2024-2025",
        fileName: "Huong_dan_ArcGIS.pdf",
        fileSize: 18874368,
        fileType: "application/pdf",
      },
      {
        title: "De cuong mon Dia chat dau khi - HK1 2024-2025",
        description: "De cuong chi tiet mon Dia chat dau khi, bao gom muc tieu mon hoc, noi dung bai giang, tai lieu tham khao va phuong phap danh gia.",
        faculty: "Khoa Dau khi",
        subject: "Dia chat dau khi",
        category: "De cuong mon hoc",
        tags: ["Dia chat dau khi", "Petrel"],
        uploaderId: systemUserId,
        status: "approved" as const,
        downloadCount: 78,
        viewCount: 280,
        averageRating: 38,
        ratingCount: 9,
        year: "2024-2025",
        fileName: "De_cuong_DCDK.pdf",
        fileSize: 2097152,
        fileType: "application/pdf",
      },
      {
        title: "Bai tap lon Dia chat thuy van - Danh gia tru luong nuoc ngam",
        description: "Bai tap lon mon Dia chat thuy van. Noi dung: Danh gia tru luong nuoc ngam khu vuc dong bang song Hong bang phuong phap mo hinh so.",
        faculty: "Khoa Dia chat",
        subject: "Dia chat thuy van",
        category: "Bai tap lon",
        tags: ["Dia chat thuy van", "Dia chat cong trinh"],
        uploaderId: systemUserId,
        status: "approved" as const,
        downloadCount: 56,
        viewCount: 190,
        averageRating: 36,
        ratingCount: 7,
        year: "2023-2024",
        fileName: "BTL_DCTV.zip",
        fileSize: 8388608,
        fileType: "application/zip",
      },
      {
        title: "Tai lieu tieng Anh - Introduction to Mining Engineering",
        description: "Sach giao trinh tieng Anh ve Khai thac Mo, gioi thieu tong quan ve nganh khai khoang, cac phuong phap khai thac va xu ly khoang san.",
        faculty: "Khoa Mo",
        subject: "Anh van chuyen nganh",
        category: "Tai lieu tieng Anh",
        tags: ["Khai thac lo thien", "Khai thac ham lo"],
        uploaderId: systemUserId,
        status: "approved" as const,
        downloadCount: 112,
        viewCount: 380,
        averageRating: 43,
        ratingCount: 15,
        year: "2024-2025",
        fileName: "Intro_Mining_Engineering.pdf",
        fileSize: 31457280,
        fileType: "application/pdf",
      },
      {
        title: "Slide Moi truong mo - Quan ly chat thai ran",
        description: "Slide bai giang mon Moi truong mo, chuong Quan ly chat thai ran trong hoat dong khai thac khoang san. Bao gom cac tieu chuan moi truong.",
        faculty: "Khoa Moi truong",
        subject: "Moi truong mo",
        category: "Slide bai giang",
        tags: ["An toan mo"],
        uploaderId: systemUserId,
        status: "approved" as const,
        downloadCount: 67,
        viewCount: 230,
        averageRating: 39,
        ratingCount: 11,
        year: "2024-2025",
        fileName: "MTM_Chat_thai_ran.pptx",
        fileSize: 12582912,
        fileType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      },
      {
        title: "Huong dan Petrel - Mo hinh hoa via chua dau khi",
        description: "Tai lieu huong dan su dung phan mem Petrel de mo hinh hoa via chua dau khi. Danh cho sinh vien Khoa Dau khi nam 3-4.",
        faculty: "Khoa Dau khi",
        subject: "Mo hinh hoa dia chat",
        category: "Phan mem chuyen nganh",
        tags: ["Petrel", "Dia chat dau khi", "Petromod"],
        uploaderId: systemUserId,
        status: "approved" as const,
        downloadCount: 94,
        viewCount: 320,
        averageRating: 47,
        ratingCount: 16,
        year: "2024-2025",
        fileName: "Petrel_Guide.pdf",
        fileSize: 22020096,
        fileType: "application/pdf",
      },
      {
        title: "Bai tap lon AutoCAD mo - Thiet ke bang mat mo lo thien",
        description: "Bai tap lon huong dan ve bang mat mo lo thien su dung AutoCAD. Bao gom ban ve mau va huong dan chi tiet tung buoc.",
        faculty: "Khoa Mo",
        subject: "Tin hoc mo",
        category: "Bai tap lon",
        tags: ["AutoCAD", "Khai thac lo thien", "GIS mo"],
        uploaderId: systemUserId,
        status: "approved" as const,
        downloadCount: 132,
        viewCount: 450,
        averageRating: 41,
        ratingCount: 19,
        year: "2023-2024",
        fileName: "BTL_AutoCAD_Mo.zip",
        fileSize: 15728640,
        fileType: "application/zip",
      },
    ];

    await db.insert(documents).values(seedDocs).onConflictDoNothing();
    console.log(`Seeded ${seedDocs.length} documents`);
  }

  const [badgeCount] = await db.select({ count: count() }).from(badges);
  if (Number(badgeCount?.count) === 0) {
    const seedBadges = [
      {
        name: "Thanh vien moi",
        description: "Chao mung ban den voi HUMG Share!",
        icon: "UserPlus",
        color: "#22c55e",
        type: "join",
        requirement: 0,
      },
      {
        name: "Nguoi chia se",
        description: "Upload tai lieu dau tien duoc duyet",
        icon: "Upload",
        color: "#3b82f6",
        type: "upload",
        requirement: 1,
      },
      {
        name: "Coc Dong",
        description: "Upload 5 tai lieu chat luong duoc duyet",
        icon: "Award",
        color: "#f59e0b",
        type: "upload",
        requirement: 5,
      },
      {
        name: "Chuyen gia",
        description: "Upload 20 tai lieu chat luong duoc duyet",
        icon: "Crown",
        color: "#8b5cf6",
        type: "upload",
        requirement: 20,
      },
      {
        name: "Thanh vien tich cuc",
        description: "Dat 50 diem karma",
        icon: "Zap",
        color: "#ef4444",
        type: "points",
        requirement: 50,
      },
      {
        name: "Nha binh luan",
        description: "Binh luan 10 tai lieu",
        icon: "MessageCircle",
        color: "#06b6d4",
        type: "comment",
        requirement: 10,
      },
      {
        name: "Da xac thuc",
        description: "Tai khoan da duoc xac thuc boi admin",
        icon: "CheckCircle",
        color: "#10b981",
        type: "verified",
        requirement: 0,
      },
      {
        name: "Nguoi dan duong",
        description: "Dat 200 diem karma",
        icon: "Compass",
        color: "#ec4899",
        type: "points",
        requirement: 200,
      },
    ];

    await db.insert(badges).values(seedBadges).onConflictDoNothing();
    console.log(`Seeded ${seedBadges.length} badges`);
  }

  const [shopCount] = await db.select({ count: count() }).from(shopItems);
  if (Number(shopCount?.count) === 0) {
    const seedShopItems = [
      {
        name: "Tai lieu Premium - 1 thang",
        description: "Truy cap tat ca tai lieu premium trong 1 thang, bao gom do an tot nghiep va luan van chat luong cao.",
        cost: 100,
        type: "subscription",
        icon: "Star",
        isActive: true,
      },
      {
        name: "AI Quiz Solver",
        description: "Cong cu AI giup giai de thi va tra loi cau hoi on tap tu dong. Su dung 10 lan.",
        cost: 50,
        type: "tool",
        icon: "Brain",
        isActive: true,
      },
      {
        name: "Template Excel Tinh toan mo",
        description: "Bo template Excel chuyen dung cho cac phep tinh toan khai thac mo: thiet ke no min, tinh toan che do khoan...",
        cost: 30,
        type: "template",
        icon: "FileSpreadsheet",
        isActive: true,
      },
      {
        name: "Script Python cho GIS",
        description: "Bo script Python tich hop voi ArcGIS va QGIS de xu ly du lieu dia khong gian chuyen nganh.",
        cost: 40,
        type: "tool",
        icon: "Code",
        isActive: true,
      },
      {
        name: "Khoa hoc Surpac nang cao",
        description: "Truy cap khoa hoc video huong dan Surpac nang cao: Mo hinh hoa 3D, thiet ke mo, lap ke hoach khai thac.",
        cost: 150,
        type: "course",
        icon: "GraduationCap",
        isActive: true,
      },
      {
        name: "Danh hieu tuy chinh",
        description: "Tuy chinh danh hieu hien thi tren profile ca nhan cua ban.",
        cost: 80,
        type: "cosmetic",
        icon: "Palette",
        isActive: true,
      },
    ];

    await db.insert(shopItems).values(seedShopItems).onConflictDoNothing();
    console.log(`Seeded ${seedShopItems.length} shop items`);
  }

  const [threadCount] = await db.select({ count: count() }).from(forumThreads);
  if (Number(threadCount?.count) === 0) {
    const seedThreads = [
      {
        title: "Hoi ve cach su dung Surpac thiet ke mo lo thien?",
        content: "Minh dang lam do an tot nghiep ve thiet ke mo lo thien, can su dung Surpac de mo hinh hoa. Ai co kinh nghiem huong dan minh voi! Minh bi ket o buoc import du lieu khoan tham do.",
        courseCode: "KTM301",
        faculty: "Khoa Mo",
        authorId: systemUserId,
        isPinned: false,
        isLocked: false,
      },
      {
        title: "[Thong bao] Huong dan su dung HUMG Share",
        content: "Chao mung cac ban den voi HUMG Share! Day la nen tang chia se tai nguyen hoc tap danh cho sinh vien, giang vien va cuu sinh vien Dai hoc Mo - Dia chat.\n\n1. Dang ky tai khoan\n2. Upload tai lieu de nhan diem\n3. Tim kiem va tai tai lieu\n4. Tham gia thao luan tren dien dan\n\nMoi thac mac xin lien he admin.",
        faculty: "Khoa Mo",
        authorId: systemUserId,
        isPinned: true,
        isLocked: false,
      },
      {
        title: "Ai co de thi Co hoc dat da nam 2024 khong?",
        content: "Minh dang can de thi Co hoc dat da ky vua roi de on tap. Ai co thi share len HUMG Share giup minh voi. Cam on nhieu!",
        courseCode: "DCC201",
        faculty: "Khoa Dia chat",
        authorId: systemUserId,
        isPinned: false,
        isLocked: false,
      },
      {
        title: "Chia se kinh nghiem thuc tap tai mo than Quang Ninh",
        content: "Minh vua di thuc tap tai mo than Ha Lam - Quang Ninh ve. Chia se mot so kinh nghiem:\n\n- Mang theo giay bao ho lao dong\n- Chuan bi so tay ghi chep\n- Hoc cach doc ban do dia chat truoc khi di\n- Chu y an toan lao dong\n\nBan nao co thac mac cu hoi minh nhe!",
        faculty: "Khoa Mo",
        authorId: systemUserId,
        isPinned: false,
        isLocked: false,
      },
      {
        title: "Lam the nao de cai dat Petrel tren may ca nhan?",
        content: "Minh muon cai Petrel de hoc mo hinh hoa dia chat dau khi nhung khong biet cach cai tren may ca nhan. Ai biet chi minh voi. Minh dung Windows 11, RAM 16GB.",
        courseCode: "DKH201",
        faculty: "Khoa Dau khi",
        authorId: systemUserId,
        isPinned: false,
        isLocked: false,
      },
    ];

    const insertedThreads = await db.insert(forumThreads).values(seedThreads).returning();
    console.log(`Seeded ${insertedThreads.length} forum threads`);

    if (insertedThreads.length > 0) {
      const seedReplies = [
        {
          threadId: insertedThreads[0].id,
          userId: systemUserId,
          content: "Ban co the tham khao tai lieu huong dan Surpac tren HUMG Share nhe. Minh da upload roi, tim trong muc Phan mem chuyen nganh.",
        },
        {
          threadId: insertedThreads[2].id,
          userId: systemUserId,
          content: "Minh co de thi nam 2023, de nam 2024 chua co. Minh se upload len som nhe!",
        },
        {
          threadId: insertedThreads[4].id,
          userId: systemUserId,
          content: "Petrel can license cua Schlumberger. Ban co the xin license academic qua truong. Lien he Khoa Dau khi de biet them chi tiet.",
        },
      ];

      await db.insert(forumReplies).values(seedReplies).onConflictDoNothing();
      await db.update(forumThreads).set({ replyCount: 1 }).where(
        or(
          eq(forumThreads.id, insertedThreads[0].id),
          eq(forumThreads.id, insertedThreads[2].id),
          eq(forumThreads.id, insertedThreads[4].id),
        )
      );
      console.log(`Seeded ${seedReplies.length} forum replies`);
    }
  }
}
