import tcb from '@cloudbase/node-sdk';

type TcbApp = ReturnType<typeof tcb.init>;

const globalForTcb = globalThis as unknown as {
  tcbApp: TcbApp | undefined;
};

// TCB 应用懒加载初始化
function getTcbApp(): TcbApp {
  if (globalForTcb.tcbApp) {
    return globalForTcb.tcbApp;
  }

  const envId = process.env.TCB_ENV_ID;
  const secretId = process.env.TCB_SECRET_ID;
  const secretKey = process.env.TCB_SECRET_KEY;

  if (!envId) {
    throw new Error('TCB_ENV_ID 环境变量未配置');
  }

  let app: TcbApp;

  // 在云函数环境中可以不传 secretId/secretKey
  if (secretId && secretKey) {
    app = tcb.init({
      env: envId,
      secretId,
      secretKey,
    });
  } else {
    // 云函数环境，使用默认认证
    app = tcb.init({
      env: envId,
    });
  }

  if (process.env.NODE_ENV !== 'production') {
    globalForTcb.tcbApp = app;
  }

  return app;
}

// 上传文件到云存储
export async function uploadFile(
  cloudPath: string,
  fileContent: Buffer
): Promise<string> {
  const app = getTcbApp();
  const result = await app.uploadFile({
    cloudPath,
    fileContent,
  });

  if (result.fileID) {
    // 获取文件的临时访问链接
    const urlResult = await app.getTempFileURL({
      fileList: [result.fileID],
    });
    if (urlResult.fileList && urlResult.fileList[0]?.tempFileURL) {
      return urlResult.fileList[0].tempFileURL;
    }
    // 如果获取临时链接失败，返回 fileID
    return result.fileID;
  }

  throw new Error('文件上传失败');
}

// 获取文件访问链接
export async function getFileUrl(fileID: string): Promise<string> {
  const app = getTcbApp();
  const result = await app.getTempFileURL({
    fileList: [fileID],
  });

  if (result.fileList && result.fileList[0]?.tempFileURL) {
    return result.fileList[0].tempFileURL;
  }

  throw new Error('获取文件链接失败');
}

// 删除文件
export async function deleteFile(fileID: string): Promise<void> {
  const app = getTcbApp();
  await app.deleteFile({
    fileList: [fileID],
  });
}
