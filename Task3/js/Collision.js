export function intersects(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export function resolvePlatformCollision(player, platform) {
  if (!intersects(player, platform)) {
    return false;
  }

  const previousBottom = player.previousY + player.height;
  const previousTop = player.previousY;
  const previousRight = player.previousX + player.width;
  const previousLeft = player.previousX;

  if (previousBottom <= platform.y && player.velocityY >= 0) {
    player.y = platform.y - player.height;
    player.velocityY = 0;
    player.onGround = true;
    player.jumpCount = 0;
    return true;
  }

  if (previousTop >= platform.y + platform.height && player.velocityY < 0) {
    player.y = platform.y + platform.height;
    player.velocityY = 0;
    return true;
  }

  if (previousRight <= platform.x && player.velocityX > 0) {
    player.x = platform.x - player.width;
    player.velocityX = 0;
    return true;
  }

  if (previousLeft >= platform.x + platform.width && player.velocityX < 0) {
    player.x = platform.x + platform.width;
    player.velocityX = 0;
    return true;
  }

  return false;
}
